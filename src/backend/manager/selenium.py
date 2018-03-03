from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from time import sleep
from pyvirtualdisplay import Display
from os import environ

class seleniumClient():
    def __init__(self, scenario):
        self.scenario = scenario

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

    def endTest(self):
        self.driver.close()
        self.stopDisplay()

    def run(self):
        self.initDisplay()
        self.initDriver()
        self.processScenario()
        self.endTest()

    def processScenario(self):
        for event in self.scenario:
            print(event)

