from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep
from pyvirtualdisplay import Display
from os import environ, makedirs, path
import errno
from pprint import pprint
from skimage.measure import compare_ssim
import cv2
class seleniumClient():
    def __init__(self, agg, msg):
        self.scenario = msg['scenario']
        self.manage = msg['manage']
        self.appId = msg['appId']
        self.scenarioId = self.scenario[0]['scenarioId']
        self.aggClient = agg
        self.baseImgDir = './screenshot'

    def initDisplay(self):
        if (environ['DISPLAY'] == ''):
            self.display = Display(visible=0, size=(1920, 1080))
            self.display.start()
        else:
            self.display = None

    def stopDisplay(self):
        if not self.display is None:
            self.display.stop()

    def initDriver(self):
        self.driver = webdriver.Chrome()
        self.driver.get(self.scenario[0]['url'])

    def initScreenShotDir(self):
        imgDir = self.baseImgDir + '/' + \
                    self.appId + '/' + \
                    self.scenarioId + '/' + \
                    str(self.testId)
        try:
            makedirs(imgDir)
        except OSError as exc:
            if exc.errno == errno.EEXIST and path.isdir(imgDir):
                pass
            else:
                raise

        self.screenshotDir = imgDir

    def endTest(self):
        self.driver.close()
        self.stopDisplay()

    def setRegressTest(self):
        response = self.aggClient.sendCommand('setRegressTest',
                {'appId': self.appId,
                'scenarioId': self.scenarioId,
                'testId': 0})

        if not response['status']:
            raise Exception(response['error'])

    def setTestId(self):
        currentTestId = 0
        if self.manage is None:
            self.setRegressTest()
            self.manage = {'regressTest': 0, 'latestTestId': 0}
        else:
            currentTestId = self.manage['lastTestId'] + 1

        response = self.aggClient.sendCommand('setTestId',
                {'appId': self.appId, 'scenarioId': self.scenarioId, 'testId': currentTestId})
        if not response['status']:
            raise Exception(response['error'])

        self.testId = currentTestId

    def run(self):
        self.initDisplay()
        self.initDriver()
        self.scenario.sort(key=lambda x: x['timestamp'])
        self.setTestId()
        self.initScreenShotDir()
        try:
            self.processScenario()
        except:
            pass
        self.endTest()
        self.analyse()

    def getElementSelector(self, selector):
        return self.driver.find_element_by_css_selector(selector)

    def selectAction(self, event):
        return getattr(self, 'action_%s' % event['type'])(event)

    def action_click(self, event):
        action = ActionChains(self.driver)
        elem = self.getElementSelector(event['locator'])
        action.move_to_element(elem)
        action.click(elem)
        print(action)
        return action

    def action_focusout(self, event):
        action = ActionChains(self.driver)
        elem = self.getElementSelector(event['locator'])
        action.move_to_element(elem)
        action.send_keys(event['content'])
        return action


    def action_keypress(self, event):
        action = ActionChains(self.driver)
        return action

    def saveScreenShot(self, event):
        image = self.screenshotDir + '/' + str(event['timestamp']) + '.png'
        self.driver.get_screenshot_as_file(image)
        self.aggClient.sendCommand('createTest', {'appId': self.appId,
                'scenarioId': self.scenarioId,
                'image': image,
                'testId': self.testId})

    def processScenario(self):
        for event in self.scenario:
            action = self.selectAction(event)
            if not action is None:
                try:
                    action.perform()
                except: pass
            self.saveScreenShot(event)
#            sleep(1)

    def analyse(self):
        sleep(5)
        if self.testId == self.manage['regressTestId']:
           return

        regressDir = self.baseImgDir + '/' + \
                     self.appId + '/' + \
                     self.scenarioId + '/' + \
                     str(self.manage['regressTestId'])

        pprint(self.testId)
        testIds = {'currentTest': self.testId, 'regressTest': self.manage['regressTestId']}
        tests = {}
        for key, value in testIds.items():
            response = self.aggClient.sendCommand('getResult', {'appId': self.appId, 'scenarioId': self.scenarioId,
                    'testId': value})
            if not response['status']:
                raise Exception(response['error'])

            tests[key] = response['data']


        if len(tests['currentTest']) != len(tests['regressTest']):
            raise Exception('Results of tests have diffrent size')

        tests['currentTest'].sort(key=lambda x: x['image'])
        tests['regressTest'].sort(key=lambda x: x['image'])

        for current, regress in zip(tests['currentTest'], tests['regressTest']):
            self.analyseScreenshot(current, regress)

    def loadImg(self, pathFile):
        return cv2.cvtColor(cv2.imread(pathFile), cv2.COLOR_BGR2GRAY)

    def analyseScreenshot(self, current, regress):
        pprint(current)
        pprint(regress)
        currentImg = self.loadImg(current['image'])
        regressImg = self.loadImg(regress['image'])

        (score, diff) = compare_ssim(regressImg, currentImg, full=True)
        msg = {'appId': self.appId, 'scenarioId': self.scenarioId,
                'id': current['id'], 'score': score, 'regressTestId': self.manage['regressTestId']}

        response = self.aggClient.sendCommand('setImgScore', msg)
