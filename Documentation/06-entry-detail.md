# Feedback entry detail

**Version:** 1.0.0  
**Route:** `/admin/entries/[id]`  
**Who can access:** Signed-in admin users

![Entry detail](./images/06-entry-detail.png)

## What this page does

Shows one customer response in full — contact details, visit answers, satisfaction, and status. Opening a **new** entry typically marks it as reviewed.

## Layout at a glance

- Back to entries link
- Contact and visit metadata
- Challenge and category selections
- Satisfaction stars and notes
- Status controls (where permitted)

## Steps

1. From the entries list, open an entry.
2. Review all fields.
3. Update status if needed (New / Reviewed / Archived), depending on your role.
4. Select **Back to entries** to return to the list.

## Errors & edge cases

- Missing or deleted entries show a short error with a link back to the list.
- Viewer roles may be read-only in Demo Mode.

## Related

- [Feedback entries](./05-entries.md)
