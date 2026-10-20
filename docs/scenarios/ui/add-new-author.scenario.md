### 1. Scenario Title

Add a new author and verify it appears on the Authors list

### 2. Steps

1. Open `https://ksiegarnia.up.railway.app/` in a clean state.
2. Click the “Authors” link in the top navigation.
3. On the “Authors Management” page, click the “Add New Author” button.
4. In the “Add New Author” dialog, enter `Jan` in the “First Name” field.
5. Enter `Testowy` in the “Last Name” field.
6. Click the “Add Author” button.
7. Enter `Testowy` in the author search field labeled “Search by first name or last name...” and press Enter.
8. Verify the author card in the filtered list.

### 3. Expected Results

1. The bookstore page loads with the top navigation (Books, Manage Books, Authors, Orders).
2. The URL changes to `/authors` and the “Authors Management” heading, search field and “Add New Author” button are displayed.
3. A modal dialog titled “Add New Author” opens with empty “First Name” and “Last Name” fields and “Cancel” and “Add Author” buttons.
4. The “First Name” field contains `Jan`.
5. The “Last Name” field contains `Testowy`.
6. The dialog closes and a green toast “Author added successfully!” is displayed. The new author is added to the list and the “Authors (N)” counter in the navigation increases.
7. The search field contains `Testowy` and the list is filtered.
8. Exactly one author card is displayed with the name “Jan Testowy”, initials “JT”, an assigned “ID: <number>”, and edit and delete buttons.

### 4. Key UI Elements

- “Authors” link in the top navigation (label includes a counter, e.g. “Authors (45)”).
- “Authors Management” page heading.
- Author search textbox labeled “Search by first name or last name...” with a search button.
- “Add New Author” button.
- “Add New Author” modal dialog with “First Name” and “Last Name” textboxes, close (×) button, “Cancel” button and “Add Author” button.
- Success toast message.
- Author card with initials avatar, full name, ID, edit button and delete button.

### 5. Test Data

- First name: `Jan`
- Last name: `Testowy`
- Search term: `Testowy`

### 6. Assertions

- After clicking “Authors”, the URL ends with `/authors` and the “Authors Management” heading is visible.
- After clicking “Add New Author”, the “Add New Author” dialog is visible with empty “First Name” and “Last Name” fields.
- After submitting, the toast “Author added successfully!” is visible and the dialog is no longer visible.
- After searching for `Testowy`, exactly one author card is visible.
- The card displays the name `Jan Testowy` and initials `JT`.
- The card displays an ID in the format `ID: <number>`.

### 7. Notes

- The application uses a shared backend. The author list and the counter in the “Authors (N)” link change between sessions (observed 45 before and 66 after the add, with other entries present), so do not assert on a fixed counter or ID value. Use a unique last name (e.g. generated per run) to avoid matching leftover authors from earlier runs.
- The new author is not guaranteed to be visible in the unfiltered list viewport (the list is sorted by last name and is long), so verification via the search field is more reliable.
- The page contains a second, hidden edit dialog with fields of the same accessible names (“First Name”, “Last Name”); locating fields by label alone matches two elements, so scope the lookup to the visible “Add New Author” dialog.
- The author search filters the list as it is submitted (Enter was used in the observed flow).
- No author deletion was performed; the created author remains in the application after the scenario.
