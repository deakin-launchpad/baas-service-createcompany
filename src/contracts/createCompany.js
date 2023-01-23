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
callsub sub4
main_l11:
int 0
return
main_l12:
callsub sub3
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
callsub sub1
int 1
return
sub0: // convert_uint_to_bytes
store 1
load 1
int 0
==
bnz sub0_l5
byte ""
store 2
load 1
store 3
sub0_l2:
load 3
int 0
>
bnz sub0_l4
load 2
b sub0_l6
sub0_l4:
load 3
int 10
%
store 4
byte "0123456789"
load 4
load 4
int 1
+
substring3
load 2
concat
store 2
load 3
int 10
/
store 3
b sub0_l2
sub0_l5:
byte "0"
sub0_l6:
retsub
sub1: // on_create
byte "company_name"
txna ApplicationArgs 0
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
int 0
store 0
sub1_l1:
load 0
txn NumAppArgs
int 1
-
<
bz sub1_l3
byte "founder"
load 0
int 1
+
callsub sub0
concat
load 0
int 1
+
txnas ApplicationArgs
app_global_put
load 0
int 1
+
store 0
b sub1_l1
sub1_l3:
retsub
sub2: // create_tokens
store 10
store 9
store 8
store 7
store 6
store 5
itxn_begin
load 10
int 1
==
bnz sub2_l2
int acfg
itxn_field TypeEnum
load 5
itxn_field ConfigAssetName
load 6
itxn_field ConfigAssetUnitName
load 7
itxn_field ConfigAssetTotal
load 8
itxn_field ConfigAssetDecimals
load 9
itxn_field ConfigAssetDefaultFrozen
b sub2_l3
sub2_l2:
int acfg
itxn_field TypeEnum
load 5
itxn_field ConfigAssetName
load 6
itxn_field ConfigAssetUnitName
load 7
itxn_field ConfigAssetTotal
load 8
itxn_field ConfigAssetDecimals
load 9
itxn_field ConfigAssetDefaultFrozen
txna Accounts 1
itxn_field ConfigAssetReserve
sub2_l3:
itxn_submit
retsub
sub3: // mint_coins
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
callsub sub2
byte "coins_id"
itxn CreatedAssetID
app_global_put
byte "minted"
int 1
app_global_put
int 1
return
sub4: // mint_shares
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
callsub sub2
byte "shares_id"
itxn CreatedAssetID
app_global_put
byte "shared"
int 1
app_global_put
int 1
return
`;

export default createCompany;
