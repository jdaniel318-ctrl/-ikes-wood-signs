# Treasury 8.8.20.166

1. Extract **Treasury.zip**. Upload the files inside its single folder to the existing Leaf 8.8.20.165 site root, replacing matching files and keeping the rest. Commit the upload and confirm **8.8.20.166 · TREASURY** in the Engine Room.
2. In Admiral Command open **Contracts & Services**, select **VoyageKeeper Recovery Test** and tap **Load vessel draft** on the device where you saved it. Tap **Online billing** beside the printable offer.
3. Choose **Saved offer** or **$99 monthly rehearsal**, then **Start rehearsal**. With the $675 setup and $175 deposit, paid support gives sample payments of $175 at agreement, $599 at accepted handoff and $99 at the second month. With $0 monthly support, handoff is $500 and the flow ends there.

## Connect Stripe

The rehearsal runs on the site immediately. Owner collection uses the private service in **Treasury-Payments.zip**. Follow **TREASURY.md** inside that archive to configure the server, verify signed events in your Stripe sandbox, then connect the public origin file. The public upload contains no private server settings.

**Treasury-Source.zip** contains complete client source. **Treasury-Rollback.zip** restores Leaf client software. Device drafts, Stripe subscriptions, private service data and Fleet records have their own storage. A website rollback does not stop active billing. Manage any active subscription in the appropriate Stripe account.

Never restore old permissions or business data during a software rollback.
