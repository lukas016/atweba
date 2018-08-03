##
# @file screenshot.py
# @author Lukas Koszegy
# @brief Porovnavanie obrazkov
##

from skimage.measure import compare_ssim
import cv2
from manager.state import testState

class analyzeScreenshot():
    def __init__(self, aggClient, appId, scenarioId, regressTestId, testId):
        self.appId = appId
        self.scenarioId = scenarioId
        self.tests = {'current': testId, 'regress': regressTestId}
        self.agg = aggClient
        self.result = 0

    # Vypocitanie celkoveho vysledku testu
    def finishResult(self, eventsCount):
        if self.result / eventsCount == 1.0:
            return testState.OK
        else:
            return testState.FAILED

    def analyze(self):
        tests = self.tests
        events = {'current': [], 'regress': []}
        # Ziskanie vysledkov pre testy
        for key, value in tests.items():
            response = self.agg.sendCommand('getResult', {'appId': self.appId, 'scenarioId': self.scenarioId,
                    'testId': [value]})
            if not response['status']:
                raise RuntimeError(testState.FAILED)

            events[key] = response['data']

        if len(events['current']) != len(events['regress']):
            raise RuntimeError(testState.COUNT_EVENTS)

        # Zoradenie obrazkov
        events['current'].sort(key=lambda x: x['image'])
        events['regress'].sort(key=lambda x: x['image'])

        # Porovnavanie obrazkov
        for current, regress in zip(events['current'], events['regress']):
            self.analyzeScreenshot(current, regress)

        return self.finishResult(len(events['current']))

    # Nacitanie obrazkov
    def loadImg(self, pathFile):
        return cv2.cvtColor(cv2.imread(pathFile), cv2.COLOR_BGR2GRAY)

    # Porovnavanie
    def analyzeScreenshot(self, current, regress):
        score = 1.0
        if current['image'] != regress['image']:
            currentImg = self.loadImg(current['image'])
            regressImg = self.loadImg(regress['image'])
            score = round(compare_ssim(regressImg, currentImg, full=False), 3)

        self.result = self.result + score
        # Ulozenie vysledku pre udalost
        self.agg.sendCommand('setImgScore', {'appId': self.appId, 'score': score, 'id': current['id'],
                'scenarioId': self.scenarioId, 'regressTestId': self.tests['regress']})
