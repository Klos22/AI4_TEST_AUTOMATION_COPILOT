### 1. Scenario Title

Search for Effective Java and verify its displayed details

### 2. Steps

1. Open `https://ksiegarnia.up.railway.app/` in a clean state.
2. Enter `effective java` in the search field labeled “Search books by title or author...”.
3. Verify the filtered book result.
4. Open the “Effective Java” result to display its details.

### 3. Expected Results

1. The bookstore page loads and displays the available books and search field.
2. The search field contains `effective java`, and the book list filters to one matching result.
3. The result displays “Effective Java”, author “Joshua Bloch”, year “2008”, price “$107.28”, and “In stock: 100”.
4. The details view displays “Effective Java”, “by Joshua Bloch”, year “2008”, availability “100 copies available”, and price “$107.28”.

### 4. Key UI Elements

- Search textbox labeled “Search books by title or author...”.
- Book result containing its title, author, year, price, stock availability, and add-to-cart button.
- Book details view with title, author, year, availability, price, and close button.

### 5. Test Data

- Search term: `effective java`
- Expected title: `Effective Java`
- Expected author: `Joshua Bloch`
- Expected year: `2008`
- Expected price: `$107.28`
- Expected stock: `100` copies

### 6. Assertions

- The search textbox contains `effective java`.
- Exactly one book result is shown for the search.
- The result title is `Effective Java` and its author is `Joshua Bloch`.
- The result shows year `2008`, price `$107.28`, and stock `100`.
- After opening the result, the details view is visible and shows the same title, author, year, and price, with availability `100 copies available`.

### 7. Notes

- The result list updates after entering the search term; clicking the search button is not required for this observed flow.
- The title, author, year, price, and availability were consistent between the result and details view. Price and stock are the values displayed by the application and were not independently verified against an external source.