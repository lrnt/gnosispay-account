# Gnosis Pay Safe account structure

![Account Structure](/account-structure.png)

## Basic Components

- a Safe with no owners
- a [roles module](https://github.com/gnosisguild/zodiac-modifier-roles) which allows Gnosis to spend tokens
- a [delay module](https://github.com/gnosisguild/zodiac-modifier-delay) which allows the user to control their Safe

## The roles module

Gnosis can spend tokens on behalf of the user to settle Visa payments. Gnosis can only:

1. Spend the token that is configured for the Gnosis Card (either EURe or GBPe)
2. Spend only within an allowance which is set by the user
3. Send the tokens to the settlement Safe used for Visa payments

The constraints mentioned above are enforced through the roles module.

## The delay module

The user has full controll over their Safe through the delay module. This means that the user can execute transactions on behalf of the Safe, but with a delay of 3 minutes.

This constraint is put in place so that Gnosis can have the assurance that payments can be settled on chain within a 3 minute timeframe.