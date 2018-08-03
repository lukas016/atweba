##
# @file selenium.py
# @author Lukas Koszegy
# @brief Simulovanie udalosti
##

from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as expCon
from time import sleep, time
from pyvirtualdisplay.display import Display
from os import environ, makedirs, path, getcwd
import errno
from logging import getLogger
from manager.state import testState
from shutil import rmtree

class seleniumClient():
    def __init__(self, agg, appId, scenarioId, manage, scenario, baseImgDir):
        self.scenario = scenario
        self.manage = manage
        self.appId = appId
        self.scenarioId = scenarioId
        self.aggClient = agg
        self.baseImgDir = baseImgDir
        self.logger = getLogger('testmanager')

    # Inicializacia virtualneho displeja
    def initDisplay(self):
        if (not 'DISPLAY' in environ) or environ['DISPLAY'] == '':
            self.display = Display(backend='xvnc', rfbport=5904, visible=0, size=(4096, 2160))
            self.display.start()
        else:
            self.display = None

    # Zrusenie vritaulneho displeja
    def stopDisplay(self):
        if not self.display is None:
            self.display.stop()

    # Inicializacia prehliadaca
    def initDriver(self):
        chromeOptions = webdriver.ChromeOptions()
        chromeOptions.add_argument('--user-data-dir=' + self.generateNewProfile())
        self.driver = webdriver.Chrome(options=chromeOptions)
        self.driver.set_window_position(0, 0)
        self.driver.get(self.scenario[0]['url'])

    # Nastavenie priecinka pre obrazky z prehliadaca
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

    # Zrusenie testovacieho prostredia
    def endTest(self):
        try:
            self.driver.close()
        except: pass

        self.stopDisplay()
        rmtree(self.generateNewProfile(), True)

    # Nastavenie prveho regresneho testu
    def setRegressTest(self):
        response = self.aggClient.sendCommand('setRegressTest',
                {'appId': self.appId,
                'scenarioId': self.scenarioId,
                'testId': 1})

        if not response['status']:
           self.logger.critical('Cannot set reggressTestId')
           raise RuntimeError(testState.FAILED)

    # Aktualizovanie velkosti okna prehliadaca podla udalosti
    def updateWindowSize(self, screenX, screenY):
        self.driver.set_window_position(0, 0)
        self.driver.set_window_size(screenX, screenY)

    # Nastavenie Id testu
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

    # Zaznamenanie regresneho testu pre aktualny test
    def setRegressTestForTest(self):
        self.aggClient.sendCommand('setRegressTestForTest',
                {'appId': self.appId, 'scenarioId': self.scenarioId,
                    'testId': self.testId, 'regressTestId': self.manage['regressTestId']})

    # Nastavenie noveho cache priecinka pre prehliadac
    def generateNewProfile(self):
        return '{}/.browserData/{:.10}-{}'.format(getcwd(), self.scenarioId, self.testId)


    def run(self):
        self.initDisplay()
        self.scenario.sort(key=lambda x: x['timestamp'])
        # Nastavenie testovacieho prostredia
        try:
            self.setTestId()
            self.initScreenShotDir()
            self.setRegressTestForTest()
            self.initDriver()
            processedEvent = 0
            # Simulovanie udalosti
            processedEvent = self.processScenario()
        except Exception as e:
            self.logger.critical(str(e))
        self.endTest()
        # Kontrola vykonania vsetkych udalosti
        if processedEvent != len(self.scenario):
            self.logger.critical('Cannot perform all events in scenario')
            raise RuntimeError(testState.FAILED)

        return (self.testId, self.manage['regressTestId'])

    # Ziskanie elementu na zaklade CSS selektora
    def getElementSelector(self, selector):
        return self.driver.find_element_by_css_selector(selector)

    # Vyber akcie na zaklade typu udalosti
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

    # Ulozenie obrazku a vysledku o simulovaniu udalosti
    def saveScreenShot(self, event, performTime):
        image = self.screenshotDir + '/' + str(event['timestamp']) + '.png'
        self.driver.get_screenshot_as_file(image)
        self.aggClient.sendCommand('createTest', {'appId': self.appId,
                'scenarioId': self.scenarioId,
                'image': image,
                'performTime': performTime,
                'testId': self.testId})

    def getPageLoaded(self):
        return self.driver.execute_script('return document.readyState;') == 'complete'

    # Replikacia udalosti
    def processScenario(self):
        pageTime = 0
        sleepTime = -1
        performTime = 0
        startTime = 0
        processedEvent = 0;
        for event in self.scenario:
            # Simulovanie uzivatelskeho casu straveneho na stranke
            if (sleepTime > 0):
                sleep(sleepTime)
                sleepTime = 0

            try:
               # Vykonanie udalosti
               action = self.selectAction(event)
               if not action is None:
                    self.updateWindowSize(event['screenX'], event['screenY'])
                    startTime = time() * 1000
                    action.perform()

            except Exception as e:
                self.logger.warning(str(e))
                self.saveScreenShot(event, performTime)
                processedEvent = processedEvent + 1
                continue

            # Vypocitanie casu pre simolovanie uzivatelskeho chovania
            endTime = time() * 1000
            performTime = endTime - startTime
            pageTime = pageTime + performTime
            sleepTime = round((event['pageTime'] - pageTime) / 100000, 2)

            self.logger.critical(sleepTime)
            # Ulozenie vysledkov
            self.saveScreenShot(event, performTime)
            processedEvent = processedEvent + 1

        self.logger.warning(processedEvent)
        return processedEvent
