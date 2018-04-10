from skimage.measure import compare_ssim
import cv2
from manager.state import testState
from pprint import pprint
class analyzeScreenshot():
    def __init__(self, aggClient, appId, scenarioId, regressTestId, testId):
        self.appId = appId
        self.scenarioId = scenarioId
        self.tests = {'current': testId, 'regress': regressTestId}
        self.agg = aggClient
        self.result = 0

    def finishResult(self, eventsCount):
        print(self.result)
        print(eventsCount)
        print(self.result / eventsCount)
        if self.result / eventsCount == 1.0:
            return testState.OK
        else:
            return testState.FAILED

    def analyze(self):
        tests = self.tests
        events = {'current': [], 'regress': []}
        for key, value in tests.items():
            response = self.agg.sendCommand('getResult', {'appId': self.appId, 'scenarioId': self.scenarioId,
                    'testId': [value]})
            if not response['status']:
                raise RuntimeError(testState.FAILED)

            events[key] = response['data']

        print(len(events['current']))
        print(len(events['regress']))

        if len(events['current']) != len(events['regress']):
            raise RuntimeError(testState.COUNT_EVENTS)

        events['current'].sort(key=lambda x: x['image'])
        events['regress'].sort(key=lambda x: x['image'])

        for current, regress in zip(events['current'], events['regress']):
            self.analyzeScreenshot(current, regress)

        return self.finishResult(len(events['current']))

    def loadImg(self, pathFile):
        return cv2.cvtColor(cv2.imread(pathFile), cv2.COLOR_BGR2GRAY)

    def analyzeScreenshot(self, current, regress):
        pprint(current)
        currentImg = self.loadImg(current['image'])
        regressImg = self.loadImg(regress['image'])

        score = round(compare_ssim(regressImg, currentImg, full=False), 4)
        print('\n')
        print(score)
        print('\n')
        self.result = self.result + score
        response = self.agg.sendCommand('setImgScore',
                    {'appId': self.appId, 'scenarioId': self.scenarioId, 'id': current['id'],
                        'score': score, 'regressTestId': self.tests['regress']})
