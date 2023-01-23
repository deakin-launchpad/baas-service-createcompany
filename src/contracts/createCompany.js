const createCompany = `#pragma version 5
txn ApplicationID
int 0
==
bnz main_l17
txn OnCompletion
int DeleteApplication
==
bnz main_l16
txn OnCompletion
int UpdateApplication
==
bnz main_l15
txn OnCompletion
int OptIn
==
bnz main_l14
txn OnCompletion
int CloseOut
==
bnz main_l13
txn OnCompletion
int NoOp
==
bnz main_l7
err
main_l7:
txna ApplicationArgs 0
byte "mint_coins"
==
bnz main_l12
txna ApplicationArgs 0
byte "mint_shares"
==
bnz main_l10
err
main_l10:
callsub sub3
main_l11:
int 0
return
main_l12:
callsub sub2
b main_l11
main_l13:
int 0
return
main_l14:
int 0
return
main_l15:
int 0
return
main_l16:
int 0
return
main_l17:
callsub sub0
int 1
return
sub0: // on_create
byte "company_name"
txna ApplicationArgs 0
app_global_put
byte "founder"
txna ApplicationArgs 1
app_global_put
byte "minted"
int 0
app_global_put
byte "shared"
int 0
app_global_put
byte "coins_id"
int 0
app_global_put
byte "shares_id"
int 0
app_global_put
byte "directorA"
txna ApplicationArgs 1
app_global_put
byte "directorB"
txna ApplicationArgs 2
app_global_put
byte "directorC"
txna ApplicationArgs 3
app_global_put
retsub
sub1: // create_tokens
store 5
store 4
store 3
store 2
store 1
store 0
itxn_begin
load 5
int 1
==
bnz sub1_l2
int acfg
itxn_field TypeEnum
load 0
itxn_field ConfigAssetName
load 1
itxn_field ConfigAssetUnitName
load 2
itxn_field ConfigAssetTotal
load 3
itxn_field ConfigAssetDecimals
load 4
itxn_field ConfigAssetDefaultFrozen
b sub1_l3
sub1_l2:
int acfg
itxn_field TypeEnum
load 0
itxn_field ConfigAssetName
load 1
itxn_field ConfigAssetUnitName
load 2
itxn_field ConfigAssetTotal
load 3
itxn_field ConfigAssetDecimals
load 4
itxn_field ConfigAssetDefaultFrozen
txna Accounts 1
itxn_field ConfigAssetReserve
sub1_l3:
itxn_submit
retsub
sub2: // mint_coins
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
gtxn 0 RekeyTo
global ZeroAddress
==
assert
byte "minted"
app_global_get
int 0
==
txn NumAppArgs
int 6
==
&&
assert
txna ApplicationArgs 1
txna ApplicationArgs 2
txna ApplicationArgs 3
btoi
txna ApplicationArgs 4
btoi
txna ApplicationArgs 5
btoi
int 1
callsub sub1
byte "coins_id"
itxn CreatedAssetID
app_global_put
byte "minted"
int 1
app_global_put
int 1
return
sub3: // mint_shares
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
gtxn 0 RekeyTo
global ZeroAddress
==
assert
byte "shared"
app_global_get
int 0
==
txna ApplicationArgs 1
byte "company_name"
app_global_get
==
&&
txn NumAppArgs
int 6
==
&&
assert
txna ApplicationArgs 1
txna ApplicationArgs 2
txna ApplicationArgs 3
btoi
txna ApplicationArgs 4
btoi
txna ApplicationArgs 5
btoi
int 0
callsub sub1
byte "shares_id"
itxn CreatedAssetID
app_global_put
byte "shared"
int 1
app_global_put
int 1
return`;

export default createCompany;
