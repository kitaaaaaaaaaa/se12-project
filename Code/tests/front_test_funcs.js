// Code from the following article: 
// https://alexwlchan.net/2023/testing-javascript-without-a-framework/

export let test_failed = false;

export function renderTest(description, body_of_test) {
    const result = document.createElement("p");
    result.classList.add("test_result");

    try {
        body_of_test();
        result.classList.add("success");
        result.innerHTML = description;
        console.log(`✅ ${description} passed`);
    } catch (error) {
        test_failed = true;
        result.classList.add("failure");
        result.innerHTML = `${description}<br/><pre>${error}</pre>`;
        console.log(`❌ ${description} failed with ${error}`);
    }

    document.body.appendChild(result);
}

export function assertEqual(x, y) {
    if (
        x === y ||
        (typeof x === "object" &&
        typeof y === "object" &&
        x.length === y.length &&
        x.every((element, index) => element === y[index]))
    ) {
        return;
    } else {
        throw new Error(`${x} &lt${typeof x}&gt != ${y} &lt${typeof y}&gt`);
    }
}

export function assertTrue(x) {
    assertEqual(x, true);
}

export function assertFalse(x) {
    assertEqual(x, false);
}