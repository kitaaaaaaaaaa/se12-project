import { test_failed, renderTest, assertEqual, assertTrue, assertFalse } from './front_test_funcs.js'

console.log("------- Starting front end unit tests -------");

// Unit tests are written here
try {
renderTest('createPublicationYearLabel: a range of years', () => {
    assertEqual(
        createPublicationYearLabel({ afterYear: '2001', beforeYear: '2002' }),
        'published between 2001 and 2002'
    );
});

renderTest("addNumbers: Add 3 + 2", () => {
    assertEqual(
        addNumbers(3, 2),
        5
    );
})
} catch (error) {
    console.log(`❌ A test failed with ${error}`);
}

// Exit the script when all tests are finished
if (test_failed) {
    console.log("✅ Tests passed, exiting the script")
    process.exit(1);
} else {
    console.log("❌ Tests failed, exiting the script")
    process.exit(0);
}