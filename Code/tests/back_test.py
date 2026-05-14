import pytest

# Actual business functions in ./modules/math_numbers.py
def add(a, b):
    return a + b

def subtract(a, b):
    return a - b

def multiply(a, b):
    return a * b

def calculate_total(prices):
    return sum(prices)

# Pytest test functions in ./tests/test_functions/test_math_numbers.py

def test_add():
    assert add(2, 3) == 5

def test_subtract():
    assert subtract(3, 2) == 1

@pytest.mark.parametrize("a, b, expected", [
    (1, 2, 2),
    (3, 0, 0),
])
def test_multiply(a, b, expected):
    assert multiply(a, b) == expected

def test_calculate_total():
    items = [10, 20, 30, 40]
    assert calculate_total(items) == 100