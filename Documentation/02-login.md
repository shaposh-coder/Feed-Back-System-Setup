# Admin login

**Version:** 1.0.0  
**Route:** `/admin/login`  
**Who can access:** Administrators and staff accounts

![Admin login](./images/02-login.png)

## What this page does

Signs authorized users into the Feedback Admin panel. In Demo Mode, clickable account cards fill credentials and sign in immediately.

## Layout at a glance

- Demo Mode banner (demo builds only)
- Demo account cards (Admin, Store Manager, Viewer)
- Manual email and password form

## Steps

1. Open `/admin/login`.
2. Either select a **demo account card**, or enter email and password.
3. Select **Sign in to admin**.
4. After a successful sign-in you land on the [Dashboard](./03-dashboard.md).

## Demo access

Demo logins are shown as account cards on this screen. Use them only in Demo Mode — never treat them as production credentials.

## Errors & edge cases

- Incorrect email or password shows a clear error above the form.
- Already signed-in users are redirected away from the login page.

## Related

- [Dashboard](./03-dashboard.md)
- [Navigation](./04-navigation.md)
