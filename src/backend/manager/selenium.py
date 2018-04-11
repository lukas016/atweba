from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep, time
from pyvirtualdisplay.display import Display
from os import environ, makedirs, path
import errno
from logging import getLogger
from manager.state import testState

class seleniumClient():
    def __init__(self, agg, appId, scenarioId, manage, scenario, baseImgDir):
        self.scenario = scenario
        self.manage = manage
        self.appId = appId
        self.scenarioId = scenarioId
        self.aggClient = agg
        self.baseImgDir = baseImgDir

    def initDisplay(self):
        if (not 'DISPLAY' in environ) or environ['DISPLAY'] == '':
            self.display = Display(visible=0, size=(4096, 2160))
            self.display.start()
        else:
            self.display = None

    def stopDisplay(self):
        if not self.display is None:
            self.display.stop()

    def initDriver(self):
        self.driver = webdriver.Chrome()
        self.driver.set_window_position(0, 0)
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
           self.logger.critical('Cannot set reggressTestId')
           raise RuntimeError(testState.FAILED)

    def updateWindowSize(self, screenX, screenY):
        self.driver.set_window_position(0, 0)
        self.driver.set_window_size(screenX, screenY)

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
            self.logger.critical('Cannot set testId')
            raise RuntimeError(testState.FAILED)

        self.testId = currentTestId

    def setRegressTestForTest(self):
        self.aggClient.sendCommand('setRegressTestForTest',
                {'appId': self.appId, 'scenarioId': self.scenarioId,
                    'testId': self.testId, 'regressTestId': self.manage['regressTestId']})

    def run(self):
        self.initDisplay()
        self.scenario.sort(key=lambda x: x['timestamp'])
        self.initDriver()
        self.setTestId()
        self.initScreenShotDir()
        self.setRegressTestForTest()
        processedEvent = 0
        self.logger.critical(len(self.scenario))
        try:
            processedEvent = self.processScenario()
        except Exception as e:
            self.logger.critical(str(e))
        self.endTest()
        if processedEvent != len(self.scenario):
            self.logger.critical('Cannot perform all events in scenario')
            raise RuntimeError(testState.FAILED)
 
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

    def action_mouseover(self, event):
        action = ActionChains(self.driver)
        elem = self.getElementSelector(event['locator'])
        action.move_to_element(elem)
        return action

    def saveScreenShot(self, event, performTime):
        image = self.screenshotDir + '/' + str(event['timestamp']) + '.png'
        self.driver.get_screenshot_as_file(image)
        self.aggClient.sendCommand('createTest', {'appId': self.appId,
                'scenarioId': self.scenarioId,
                'image': image,
                'performTime': performTime,
                'testId': self.testId})

    def processScenario(self):
        pageTime = 0
        sleepTime = -1
        parformTime = 0
        startTime = 0
        processedEvent = 0;
        for event in self.scenario:
            if (sleepTime > 0):
                sleep(sleepTime)
                sleepTime = 0

            try:
               action = self.selectAction(event)
               if not action is None:
                    self.updateWindowSize(event['screenX'], event['screenY'])
                    startTime = time() * 1000
                    action.perform()

            except: pass
            endTime = time() * 1000
            performTime = endTime - startTime
            pageTime = pageTime + performTime
            sleepTime = (event['pageTime'] - pageTime) / 1000
            self.logger.critical(sleepTime)

            self.saveScreenShot(event, performTime)
            processedEvent = processedEvent + 1

        self.logger.warning(processedEvent)
        return processedEvent
