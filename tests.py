from requests import get
from random import choice
from colorama import init, Fore

init()

# This file is used to test the API.
# There are 3 endpoints that are getting tested:
#   - /dropping
#   - /leaderboard
#   - /search
#
# /search has 3 test cases:
#   - 1 taken name (notch)
#   - 1 not taken name

API_URL = "https://OpenNam.es"


def print_failed(endpoint):
    print(f"{Fore.RED}{endpoint} test failed!{Fore.RESET}")


def print_success(endpoint):
    print(f"{Fore.GREEN}{endpoint} is working correctly 🎉{Fore.RESET}")


def generate_non_taken():
    # generating a random name that is (pretty much) guaranteed to not be taken
    symbols = "abcdefghijklmnopqrstuvwyxz1234567890_"
    return "".join([choice(symbols) for _ in range(16)])


def check_fields_exist(fields: list, obj: dict, endpoint: str) -> bool:
    for field in fields:
        if not field in obj:
            print_failed(endpoint)
            print(f"Expected {field} to be in response - it isn't.")
            return False
    return True


def check_response_code(code: int, expected: int, endpoint: str) -> bool:
    if not code == expected:
        print_failed(endpoint)
        print(f"Expected code: {expected}, actual code: {code}")
        return False
    return True


def test_dropping() -> bool:
    # Test the /dropping endpoint
    # Requirements for working test:
    #   - 200 response
    #   - Response is an array
    #   - Array is longer than 5
    #   - All elements have a name, unixDropTime and stringDropTime field

    r = get(API_URL + "/dropping")

    # test 200
    if not check_response_code(r.status_code, 200, "/dropping"):
        return False

    # test array
    try:
        data = r.json()
    except:
        print_failed("/dropping")
        print("Couldn't parse response into a python object")
        return False

    if type(data) != list:
        print_failed("/dropping")
        print(f"Parsed object was expected to be a list, not '{type(data)}'")
        return False

    # test array length
    if len(data) < 5:
        print_failed("/dropping")
        print(
            f"Length was expected to be over 5, actual length is {len(data)}")
        return False

    # test array elements
    fields = ["name", "unixDropTime", "stringDropTime"]
    for index, element in enumerate(data):
        if not check_fields_exist(fields, element, "/dropping"):
            return False

    return True


def test_leaderboard() -> bool:
    # Test the /leaderboard endpoint
    # Requirements for working test:
    #   - 200 response
    #   - Response is an array
    #   - Array is longer than 9
    #   - All elements have a name, monthlyViews, lifetimeViews and owner_history fields

    r = get(API_URL + "/leaderboard")

    # test 200
    if not check_response_code(r.status_code, 200, "/leaderboard"):
        return False

    # test array
    try:
        data = r.json()
    except:
        print_failed("/leaderboard")
        print("Couldn't parse response into a python object")
        return False

    if type(data) != list:
        print_failed("/leaderboard")
        print(f"Parsed object was expected to be a list, not '{type(data)}'")
        return False

    # test array length
    if len(data) < 8:
        print_failed("/leaderboard")
        print(
            f"Length was expected to be over 9, actual length is {len(data)}")
        return False

    # test array elements
    fields = ["name", "monthlyViews", "lifetimeViews", "owner_history"]
    for index, element in enumerate(data):
        if not check_fields_exist(fields, element, "/leaderboard"):
            return False
    return True


def test_search(name: str, mode: int) -> bool:
    # mode 0: not taken
    # response has to contain 'name', 'owner_history', 'lastUpdated', 'monthlyViews', 'lifetimeViews'
    # mode 1: taken
    # response has to contain 'name', 'uuid', 'name_history', 'owner_history', 'lastUpdated', 'monthlyViews', 'lifetimeViews'
    # mode 2: dropping soon
    # response has to contain 'name', 'owner_history', 'lastUpdated', 'monthlyViews', 'lifetimeViews', 'unixDropTime', 'stringDropTime'
    #
    # Also, for all names:
    #   - responses have to be 200
    #   - responses have to be valid json
    r = get(API_URL + "/search?query=" + name)

    # test 200
    if not check_response_code(r.status_code, 200, "/search"):
        return False

    # test array
    try:
        data = r.json()
    except:
        print_failed("/search")
        print("Couldn't parse response into a python object")
        return False

    if type(data) != dict:
        print_failed("/search")
        print(f"Parsed object was expected to be a dict, not '{type(data)}'")
        return False

    # Check fields (all)
    fields = [
        "name", "lastUpdated", "owner_history", "lifetimeViews", "monthlyViews"
    ]
    if not check_fields_exist(fields, data, "/search"):
        return False

    if mode == 1:
        return check_fields_exist(["uuid", "name_history"], data, "/search")

    elif mode == 2:
        return check_fields_exist(["unixDropTime", "stringDropTime"], data,
                                  "/search")

    return True


if __name__ == "__main__":
    print()
    print("Testing /dropping...")
    result1 = test_dropping()
    if result1:
        print_success("/dropping")

    print("\nTesting /leaderboard...")
    result2 = test_leaderboard()
    if result2:
        print_success("/leaderboard")

    generated_name = generate_non_taken()
    print(f"\nTesting /search with {generated_name} (not taken)...")
    result3 = test_search(generated_name, 0)
    if result3:
        print_success("/search")

    print(f"\nTesting /search with Notch (taken)...")
    result4 = test_search(generated_name, 1)
    if result4:
        print_success("/search")

    print(f"\nTesting /search with Down (dropping)...")
    result5 = test_search(generated_name, 2)
    if result5:
        print_success("/search")

    if result1 and result2 and result3 and result4 and result5:
        print(Fore.GREEN + "All tests were a success! 🎉🎉🎉" + Fore.RESET)
    else:
        print(Fore.RED + "\nSome tests weren't successful\n" + Fore.RESET)
