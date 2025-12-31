# React Migration Parity Checklist

Use this checklist to validate React UI islands against legacy behavior.

## Calendar modal
- Open Calendar modal from the Calendar view (Full List button).
- Switch tabs (Label/Public/Eras) and confirm list content updates.
- Toggle each filter and verify list items update with no legacy elements visible.
- Scroll the list and confirm rows render with label tags, act names, titles, and distribution.
- Close and reopen the modal; confirm it re-renders with current state.

## Track slots
- In Create (Manual), verify slot groups render with correct counts and column labels.
- Click Add Slot / Show Less and confirm visible slot count updates.
- Click a slot to focus, then assign a creator via click + entity list or dropdown (drag-and-drop is planned).
- Use Recommend/Clear buttons on a slot and confirm state updates.
- Switch create stages (Sheet/Demo/Master) and confirm active stage highlight.

## Pills/Tags
- Verify color + text contrast for label tags in the Calendar modal list.
- Confirm text truncation or wrapping matches legacy expectations.
- Verify dismiss buttons (if shown) are keyboard focusable and announceable.
