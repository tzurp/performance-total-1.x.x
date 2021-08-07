import performanceTotal from "./performance-total";

enum Status {
    UNKNOWN = 0,
    PASSED = 1,
    SKIPPED = 2,
    PENDING = 3,
    UNDEFINED = 4,
    AMBIGUOUS = 5,
    FAILED = 6
}

export default class PerformanceTotalService {
    _browser!: WebdriverIO.Browser;
    _serviceOptions: { disableAppendToExistingFile: boolean, performanceResultsFileName: string, dropResultsFromFailedTest: boolean, analyzeByBrowser: boolean, performanceResultsDirectory: string };
    /**
     * `serviceOptions` contains all options specific to the service
     * e.g. if defined as follows:
     *
     * ```
     * services: [['custom', { foo: 'bar' }]]
     * ```
     *
     * the `serviceOptions` parameter will be: `{ foo: 'bar' }`
     */
    constructor(serviceOptions: { disableAppendToExistingFile: boolean, performanceResultsFileName: string, dropResultsFromFailedTest: boolean, analyzeByBrowser: boolean, performanceResultsDirectory: string }, capabilities: any, config: any) {
        this._serviceOptions = serviceOptions;
    }

    before(config: any, capabilities: any, browser: WebdriverIO.Browser) {
        this._browser = browser;
    }

    async beforeTest(test: any, context: any) {
        await performanceTotal.initialize(this._serviceOptions.disableAppendToExistingFile, this._serviceOptions.performanceResultsDirectory);
    }

    async beforeScenario(test: any, context: any) {
        await performanceTotal.initialize(this._serviceOptions.disableAppendToExistingFile, this._serviceOptions.performanceResultsDirectory);
    }

    //@ts-ignore
    afterTest(test: any, context: any, { error, result, duration, passed, retries }: any) {
        performanceTotal.finalize(this._browser, passed);
    }

    afterScenario({ result }: any) {
        let status = false;

        if (result != undefined && result.status === Status.PASSED) {
            status = true;
        }
        else if (result == undefined) {
            status = true;
            console.log("Performance-Total Warning: There is a WebdriverIO issue that can't recognize Cucumber test status. Therefore the option 'dropResultsFromFailedTest' will not work. Please use version 2.x.x with WebdriverIO version >= 7.x.x .");
        }

        performanceTotal.finalize(this._browser, status);
    }

    async after(exitCode: any, config: any, capabilities: any) {
        await performanceTotal.analyzeResults({ performanceResultsFileName: this._serviceOptions.performanceResultsFileName, dropResultsFromFailedTest: this._serviceOptions.dropResultsFromFailedTest, analyzeByBrowser: this._serviceOptions.analyzeByBrowser });
    }
}
