from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep
from pyvirtualdisplay import Display
from os import environ, makedirs, path
import errno
from pprint import pprint
class seleniumClient():
    def __init__(self, agg, appId, scenarioId, manage, scenario, baseImgDir):
        self.scenario = scenario
        self.manage = manage
        self.appId = appId
        self.scenarioId = scenarioId
        self.aggClient = agg
        self.baseImgDir = baseImgDir

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
                'testId': 1})

        if not response['status']:
            raise Exception(response['error'])

    def setTestId(self):
        currentTestId = 1
        if self.manage is None or not 'lastTestId' in self.manage:
            self.setRegressTest()
            self.manage = {'regressTestId': 1, 'lastTestId': 1}
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
        return (self.testId, self.manage['regressTestId'])

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
