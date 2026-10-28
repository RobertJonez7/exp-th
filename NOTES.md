## Changes

- Fixed cache issue where the UI would be served stale data due to cache not being updated. Added private `refreshCache` method that fires after any mutations to documents.

- Fixed issue where bulk documents would error and exit early if an error had occurred (Document doesn't exist, document is locked, etc.). Updated code to capture errors in an array, and then display errors on screen

- Updated UI to display errors in a more user friendly fashion, instead of generic error.

- Added feature for users to lock/unlock documents
    - This was a feature mentioned in the README, however there was no implementation for it, so I added my own.

- Fixed issue where newly created document would be placed at bottom of list, instead of the top.
    - The documents were sorted in descending order on page load, so to adhere to that, I placed the newly created doc at the top of the array.

- Fixed issue where the `Locked` tag in the table was not correctly showing.

- Added a `Popover` component for locking and unlocking documents
    - I specifically added a popover so that in the future, if we ever wanted to add more options, we could add it to the popover


## AI Usage

- Used AI to scaffold tests in the `server`

- used AI to help style the `Popover` component


## Considerations

- There are no tests in the UI. Considered adding a test suite but decided against it in the interest of time.

- I refresh the cache after every deletion instead of after every batch. My inital reasoning was that I want to keep my controller as thin as
possible, and that a usecase could arise where we would only want to delete one document at a time in the future. However, it does require more compute.

- The `bulkDelete` endpoint handles a lot of error handling. I prefer to keep my controller very thin, so I was contemplating making a new method in my
service class to handle that. Unfortunately I ran out of time before I could revisit it.

- I wanted to make the popover component look better, and maybe even add icons.