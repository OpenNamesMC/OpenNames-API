from requests import get
from random import choice

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

def generate_non_taken():
    # generating a random name that is (pretty much) guaranteed to not be taken
    symbols = "abcdefghijklmnopqrstuvwyxz1234567890_"
    return "".join([choice(symbols) for _ in range(16)])

def test_dropping() -> bool:
    # Test the /dropping endpoint
    # Requirements for working test:
    #   - 200 response
    #   - Response is an array  
    #   - Array is longer than 5
    #   - All elements have a name, unixDropTime and stringDropTime field

    r = get(API_URL + "/dropping")

    # test 200
    if r.status_code != 200:
        print("/dropping test failed")
        print(f"Expected code: 200, actual code: {r.status_code}")
        return False

    # test array
    try:
        data = r.json()
    except:
        print("/dropping test failed")
        print("Couldn't parse response into a python object")
        return False

    if type(data) != list:
        print("/dropping test failed")
        print(f"Parsed object was expected to be a list, not '{type(data)}'")
        return False
    
    # test array length
    if len(data) < 5:
        print("/dropping test failed")
        print(f"Length was expected to be over 5, actual length is {len(data)}")
        return False

    # test array elements
    for index, element in enumerate(data):
        if not "name" in element:
            print("/dropping test failed")
            print(f"Didn't find 'name' in element #{index}")
            return False
        
        if not "unixDropTime" in element:
            print("/dropping test failed")
            print(f"Didn't find 'unixDropTime' in element #{index}")
            return False

        if not "stringDropTime" in element:
            print("/dropping test failed")
            print(f"Didn't find 'stringDropTime' in element #{index}")
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
    if r.status_code != 200:
        print("/leaderboard test failed")
        print(f"Expected code: 200, actual code: {r.status_code}")
        return False

    # test array
    try:
        data = r.json()
    except:
        print("/leaderboard test failed")
        print("Couldn't parse response into a python object")
        return False

    if type(data) != list:
        print("/leaderboard test failed")
        print(f"Parsed object was expected to be a list, not '{type(data)}'")
        return False
    
    # test array length
    if len(data) < 8:
        print("/leaderboard test failed")
        print(f"Length was expected to be over 9, actual length is {len(data)}")
        return False

    # test array elements
    for index, element in enumerate(data):
        if not "name" in element:
            print("/leaderboard test failed")
            print(f"Didn't find 'name' in element #{index}")
            return False
        
        if not "monthlyViews" in element:
            print("/leaderboard test failed")
            print(f"Didn't find 'monthlyViews' in element #{index}")
            return False

        if not "lifetimeViews" in element:
            print("/leaderboard test failed")
            print(f"Didn't find 'lifetimeViews' in element #{index}")
            return False

        if not "owner_history" in element:
            print("/leaderboard test failed")
            print(f"Didn't find 'owner_history' in element #{index}")
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
    if r.status_code != 200:
        print("/search test failed")
        print(f"Expected code: 200, actual code: {r.status_code}")
        return False

    # test array
    try:
        data = r.json()
    except:
        print("/search test failed")
        print("Couldn't parse response into a python object")
        return False

    if type(data) != dict:
        print("/search test failed")
        print(f"Parsed object was expected to be a dict, not '{type(data)}'")
        return False

    # Check fields (all)
    if not "name" in data:
        print("/search test failed")
        print("'name' was expected to be in response")
        return False 

    if not "lastUpdated" in data:
        print("/search test failed")
        print("'lastUpdated' was expected to be in response")
        return False 

    if not "owner_history" in data:
        print("/search test failed")
        print("'owner_history' was expected to be in response")
        return False  

    if not "monthlyViews" in data:
        print("/search test failed")
        print("'monthlyViews' was expected to be in response")
        return False 

    if not "lifetimeViews" in data:
        print("/search test failed")
        print("'lifetimeViews' was expected to be in response")
        return False  

    if mode == 1:
        if not "uuid" in data:
            print("/search test failed")
            print("'uuid' was expected to be in response")
            return False  

        if not "name_history" in data:
            print("/search test failed")
            print("'name_history' was expected to be in response")
            return False 

    if mode == 2:
        if not "unixDropTime" in data:
            print("/search test failed")
            print("'unixDropTime' was expected to be in response")
            return False  

        if not "stringDropTime" in data:
            print("/search test failed")
            print("'stringDropTime' was expected to be in response")
            return False 

    return True

if __name__ == "__main__":
    print()
    print("Testing /dropping...")
    result1 = test_dropping()
    if result1:
        print("/dropping is working correctly 🎉")

    print("\nTesting /leaderboard...")
    result2 = test_leaderboard()
    if result2:
        print("/leaderboard is working correctly 🎉")

    generated_name = generate_non_taken()
    print(f"\nTesting /search with {generated_name} (not taken)...")
    result3 = test_search(generated_name, 0)
    if result3:
        print("/search is working correctly 🎉")

    print(f"\nTesting /search with Notch (taken)...")
    result4 = test_search(generated_name, 1)
    if result4:
        print("/search is working correctly 🎉")

    print(f"\nTesting /search with Down (dropping)...")
    result5 = test_search(generated_name, 2)
    if result5:
        print("/search is working correctly 🎉")

    if result1 and result2 and result3 and result4 and result5:
        print("All tests were a success! 🎉🎉🎉")
    else:
        print("\nSome tests weren't successful\n")



    
