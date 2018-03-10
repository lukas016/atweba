from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep
from pyvirtualdisplay import Display
from os import environ
from pprint import pprint
class seleniumClient():
    def __init__(self, agg, scenario):
        self.scenario = scenario
        self.aggClient = agg

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

    def endTest(self):
        self.driver.close()
        self.stopDisplay()

    def setResultId(self):
        lastResultId = 0
        appId = self.scenario[0]['appId']
        _id = self.scenario[0]['_id']
        if 'lastResultId' in self.scenario[0]:
            lastResultId = self.scenario[0]['lastResultId'] + 1;

        response = self.aggClient.sendCommand('setResultId',
                {'appId': appId, '_id': _id, 'lastResultId': lastResultId})
        if not response['status']:
            raise Exception(response['error'])

        self.resultId = lastResultId

    def run(self):
        self.initDisplay()
        self.initDriver()
        self.scenario.sort(key=lambda x: x['timestamp'])
        self.setResultId()
        try:
            self.processScenario()
        except:
            pass
        self.endTest()

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

    def processScenario(self):
        for event in self.scenario:
            action = self.selectAction(event)
            if not action is None:
                try:
                    action.perform()
                except: pass
            self.driver.get_screenshot_as_file(
                    '{}_{}_{}.png'.format(event['appId'], event['scenarioId'], event['timestamp']))
            self.aggClient.sendCommand('createResult', {'appId': event['appId'],
                'scenarioId': event['scenarioId'],
                'image': '{}_{}_{}.png'.format(event['appId'], event['scenarioId'], event['timestamp']),
                'resultId': self.resultId
            })
            sleep(5)

