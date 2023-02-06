const createCompany = `#pragma version 8
txn ApplicationID
int 0
==
bnz main_l21
txn OnCompletion
int DeleteApplication
==
bnz main_l20
txn OnCompletion
int UpdateApplication
==
bnz main_l19
txn OnCompletion
int OptIn
==
bnz main_l18
txn OnCompletion
int CloseOut
==
bnz main_l17
txn OnCompletion
int NoOp
==
bnz main_l7
err
main_l7:
txna ApplicationArgs 0
byte "mint_coins"
==
bnz main_l16
txna ApplicationArgs 0
byte "mint_shares"
==
bnz main_l15
txna ApplicationArgs 0
byte "deposit_coins"
==
bnz main_l14
txna ApplicationArgs 0
byte "distribute_shares"
==
bnz main_l12
err
main_l12:
callsub distributeshares_9
main_l13:
int 0
return
main_l14:
callsub depositcoins_10
b main_l13
main_l15:
callsub mintshares_6
b main_l13
main_l16:
callsub mintcoins_5
b main_l13
main_l17:
int 0
return
main_l18:
int 0
return
main_l19:
int 0
return
main_l20:
int 0
return
main_l21:
callsub oncreate_1
int 1
return

// convert_uint_to_bytes
convertuinttobytes_0:
store 1
load 1
int 0
==
bnz convertuinttobytes_0_l5
byte ""
store 2
load 1
store 3
convertuinttobytes_0_l2:
load 3
int 0
>
bnz convertuinttobytes_0_l4
load 2
b convertuinttobytes_0_l6
convertuinttobytes_0_l4:
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
b convertuinttobytes_0_l2
convertuinttobytes_0_l5:
byte "0"
convertuinttobytes_0_l6:
retsub

// on_create
oncreate_1:
txn NumAppArgs
int 1
==
assert
byte "company_name"
txna ApplicationArgs 0
app_global_put
byte "company_wallet"
global CurrentApplicationAddress
app_global_put
byte "coins_id"
int 0
app_global_put
byte "shares_id"
int 0
app_global_put
byte "vault_id"
int 0
app_global_put
byte "vault_wallet"
byte ""
app_global_put
int 1
store 0
oncreate_1_l1:
load 0
txn NumAccounts
int 1
+
<
bz oncreate_1_l3
byte "founder"
load 0
callsub convertuinttobytes_0
concat
load 0
txnas Accounts
app_global_put
load 0
int 1
+
store 0
b oncreate_1_l1
oncreate_1_l3:
byte "number_of_founder"
load 0
int 1
-
app_global_put
retsub

// get_global_value
getglobalvalue_2:
store 16
store 15
load 15
load 16
app_global_get_ex
store 18
store 17
load 17
retsub

// create_tokens
createtokens_3:
store 24
store 23
store 22
store 21
store 20
store 19
itxn_begin
load 24
int 1
==
bnz createtokens_3_l2
int acfg
itxn_field TypeEnum
load 19
itxn_field ConfigAssetName
load 20
itxn_field ConfigAssetUnitName
load 21
itxn_field ConfigAssetTotal
load 22
itxn_field ConfigAssetDecimals
load 23
itxn_field ConfigAssetDefaultFrozen
b createtokens_3_l3
createtokens_3_l2:
int acfg
itxn_field TypeEnum
load 19
itxn_field ConfigAssetName
load 20
itxn_field ConfigAssetUnitName
load 21
itxn_field ConfigAssetTotal
load 22
itxn_field ConfigAssetDecimals
load 23
itxn_field ConfigAssetDefaultFrozen
txna Accounts 1
itxn_field ConfigAssetReserve
createtokens_3_l3:
itxn_submit
retsub

// vault_connect_and_optIn_coins
vaultconnectandoptIncoins_4:
store 26
store 25
byte "connect_company_and_optIn_to_coins"
store 27
itxn_begin
int appl
itxn_field TypeEnum
load 25
itxn_field ApplicationID
int NoOp
itxn_field OnCompletion
load 27
itxn_field ApplicationArgs
load 26
itxn_field Assets
global CurrentApplicationID
itxn_field Applications
itxn_submit
retsub

// mint_coins
mintcoins_5:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 14
mintcoins_5_l1:
load 14
int 1
<
bz mintcoins_5_l3
load 14
gtxns RekeyTo
global ZeroAddress
==
assert
load 14
int 1
+
store 14
b mintcoins_5_l1
mintcoins_5_l3:
txna Applications 1
store 5
txna Accounts 1
store 6
txna ApplicationArgs 1
store 8
txna ApplicationArgs 2
store 9
txna ApplicationArgs 3
btoi
store 10
txna ApplicationArgs 4
btoi
store 11
txna ApplicationArgs 5
btoi
store 12
int 1
store 13
byte "coins_id"
app_global_get
int 0
==
byte "vault_wallet"
app_global_get
byte ""
==
&&
byte "vault_id"
app_global_get
int 0
==
&&
load 5
byte "vault_wallet"
callsub getglobalvalue_2
load 6
==
&&
txn NumAppArgs
int 6
==
&&
assert
load 8
load 9
load 10
load 11
load 12
load 13
callsub createtokens_3
itxn CreatedAssetID
store 7
load 5
load 7
callsub vaultconnectandoptIncoins_4
byte "coins_id"
load 7
app_global_put
byte "vault_id"
load 5
app_global_put
byte "vault_wallet"
load 6
app_global_put
int 1
return

// mint_shares
mintshares_6:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 35
mintshares_6_l1:
load 35
int 1
<
bz mintshares_6_l3
load 35
gtxns RekeyTo
global ZeroAddress
==
assert
load 35
int 1
+
store 35
b mintshares_6_l1
mintshares_6_l3:
txna ApplicationArgs 1
store 29
txna ApplicationArgs 2
store 30
txna ApplicationArgs 3
btoi
store 31
txna ApplicationArgs 4
btoi
store 32
txna ApplicationArgs 5
btoi
store 33
int 0
store 34
byte "shares_id"
app_global_get
int 0
==
txn NumAppArgs
int 6
==
&&
assert
load 29
load 30
load 31
load 32
load 33
load 34
callsub createtokens_3
itxn CreatedAssetID
store 28
byte "shares_id"
load 28
app_global_put
int 1
return

// company_send_tokens
companysendtokens_7:
store 44
store 43
store 42
itxn_begin
int axfer
itxn_field TypeEnum
load 42
itxn_field XferAsset
load 44
itxn_field AssetReceiver
load 43
itxn_field AssetAmount
itxn_submit
retsub

// check_assets_holding
checkassetsholding_8:
store 47
store 46
store 45
load 46
load 47
asset_holding_get AssetBalance
store 49
store 48
load 45
byte "sender"
==
bnz checkassetsholding_8_l4
load 45
byte "receiver"
==
bnz checkassetsholding_8_l3
err
checkassetsholding_8_l3:
load 49
b checkassetsholding_8_l5
checkassetsholding_8_l4:
load 48
checkassetsholding_8_l5:
retsub

// distribute_shares
distributeshares_9:
global GroupSize
txn NumAppArgs
==
txn GroupIndex
txn NumAppArgs
int 1
-
==
&&
assert
int 0
store 41
distributeshares_9_l1:
load 41
txn NumAppArgs
<
bnz distributeshares_9_l14
txna Assets 0
store 37
byte "sender"
global CurrentApplicationAddress
load 37
callsub checkassetsholding_8
store 38
byte "number_of_founder"
app_global_get
store 36
int 0
store 39
int 1
store 40
distributeshares_9_l3:
load 40
load 36
<=
bnz distributeshares_9_l13
load 37
byte "shares_id"
app_global_get
==
load 38
load 39
==
&&
txn NumAppArgs
load 36
int 1
+
==
&&
assert
int 1
store 40
distributeshares_9_l5:
load 40
load 36
<=
bnz distributeshares_9_l12
int 1
store 40
distributeshares_9_l7:
load 40
load 36
<=
bnz distributeshares_9_l11
int 1
store 40
distributeshares_9_l9:
load 40
load 36
<=
bz distributeshares_9_l15
load 37
load 40
txnas ApplicationArgs
btoi
byte "founder"
load 40
callsub convertuinttobytes_0
concat
app_global_get
callsub companysendtokens_7
load 40
int 1
+
store 40
b distributeshares_9_l9
distributeshares_9_l11:
byte "receiver"
byte "founder"
load 40
callsub convertuinttobytes_0
concat
app_global_get
load 37
callsub checkassetsholding_8
assert
load 40
int 1
+
store 40
b distributeshares_9_l7
distributeshares_9_l12:
load 40
txnas Accounts
byte "founder"
load 40
callsub convertuinttobytes_0
concat
app_global_get
==
assert
load 40
int 1
+
store 40
b distributeshares_9_l5
distributeshares_9_l13:
load 39
load 40
txnas ApplicationArgs
btoi
+
store 39
load 40
int 1
+
store 40
b distributeshares_9_l3
distributeshares_9_l14:
load 41
gtxns RekeyTo
global ZeroAddress
==
assert
load 41
int 1
+
store 41
b distributeshares_9_l1
distributeshares_9_l15:
int 1
return

// deposit_coins
depositcoins_10:
txna Accounts 1
store 50
txna Assets 0
store 51
byte "sender"
global CurrentApplicationAddress
load 51
callsub checkassetsholding_8
store 52
byte "coins_id"
app_global_get
load 51
==
byte "vault_wallet"
app_global_get
load 50
==
&&
byte "receiver"
load 50
load 51
callsub checkassetsholding_8
&&
load 52
int 0
>=
&&
txn NumAppArgs
int 1
==
&&
assert
load 51
load 52
load 50
callsub companysendtokens_7
int 1
return
`;

export default createCompany;
