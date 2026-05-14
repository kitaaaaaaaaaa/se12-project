// Import testing functions
import { test_failed, renderTest, assertEqual, assertTrue, assertFalse } from './front_test_funcs.js'

// Import code to test
import { formatStepNumber } from '../frontend/components/editStepCard.js'


console.log("------- Starting front end unit tests -------");

// Unit tests are written here
try {
    renderTest('formatStepNumber - 1 digit int', () => {
        assertEqual(
            formatStepNumber(2),
            '02'
        );
    });

    renderTest('formatStepNumber - 2 digit int', () => {
        assertEqual(
            formatStepNumber(23),
            '23'
        );
    });
    
    renderTest('formatStepNumber - 1 digit str', () => {
        assertEqual(
            formatStepNumber("8"),
            '08'
        );
    });
    
    renderTest('formatStepNumber - 2 digit str', () => {
        assertEqual(
            formatStepNumber("13"),
            '13'
        );
    });

    renderTest('formatStepNumber - 2 digit padded str', () => {
        assertEqual(
            formatStepNumber("06"),
            '06'
        );
    });
} catch (error) {
    console.log(`❌ A test failed with ${error}`);
    test_failed = true;
}

// Exit the script when all tests are finished
if (test_failed) {
    console.log("------- ❌ Tests failed, exiting the script -------")
    process.exit(1);
} else {
    console.log("------- ✅ Tests passed, exiting the script -------")
    process.exit(0);
}