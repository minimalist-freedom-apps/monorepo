# iOS Support

## Our Position

iOS users have chosen other priorities over freedom. We are building freedom tech and have no intention of spending time developing apps for users who have made that trade-off.

## Why iOS Is Not Supported

Apple creates a hostile environment for independent developers. The restrictions imposed by iOS make it fundamentally incompatible with the principles of free and open software distribution.

### Developers Must Pay to Distribute Apps

Apple requires a [$99/year Developer Program membership](https://developer.apple.com/support/enrollment/) just to distribute apps on the App Store. This is a toll on open-source and independent developers who want to make their software available at no cost.

### Sideloading Is Severely Restricted

Unlike Android, where users can freely install APKs from any source, iOS makes it extremely difficult to install apps outside the App Store. [Apple's sideloading restrictions](https://support.apple.com/en-us/111901) force users and developers into the App Store ecosystem. Even with recent EU regulations ([Digital Markets Act](https://commission.europa.eu/strategy-and-policy/priorities-2019-2024/europe-fit-digital-age/digital-markets-act-ensuring-fair-and-open-digital-markets_en)), Apple has imposed [burdensome requirements on alternative distribution](https://developer.apple.com/support/alternative-app-marketplace-in-the-eu/).

### Push Notifications Require Apple's Service

iOS does not allow apps to receive push notifications without going through [Apple Push Notification service (APNs)](https://developer.apple.com/documentation/usernotifications). There is no way to use independent or self-hosted notification infrastructure, locking developers into Apple's proprietary service.

### App Review and Censorship

All apps distributed through the App Store are subject to [Apple's App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), which give Apple unilateral power to reject or remove apps for any reason. This is incompatible with the uncensorable nature of freedom tech.

### Restricted Background Execution

iOS heavily limits what apps can do in the background. Apple's [background execution rules](https://developer.apple.com/documentation/uikit/app_and_scenes/scenes/preparing_your_ui_to_run_in_the_background) prevent apps from maintaining persistent connections or running long-lived tasks, limiting functionality that freedom-oriented apps often depend on.

## Still want to use iOS?
We are willing to accept PR's that adds support for iOS (if the changes are isolated and easy to review). But we will not prioritize it and we will not spend time fixing issues related to iOS support.