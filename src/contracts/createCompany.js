const createCompany = `#pragma version 8
txn ApplicationID
int 0
==
bnz main_l25
txn OnCompletion
int DeleteApplication
==
bnz main_l24
txn OnCompletion
int UpdateApplication
==
bnz main_l23
txn OnCompletion
int OptIn
==
bnz main_l22
txn OnCompletion
int CloseOut
==
bnz main_l21
txn OnCompletion
int NoOp
==
bnz main_l7
err
main_l7:
txna ApplicationArgs 0
byte "add_founders"
==
bnz main_l20
txna ApplicationArgs 0
byte "mint_coins"
==
bnz main_l19
txna ApplicationArgs 0
byte "mint_shares"
==
bnz main_l18
txna ApplicationArgs 0
byte "deposit_coins"
==
bnz main_l17
txna ApplicationArgs 0
byte "distribute_shares"
==
bnz main_l16
txna ApplicationArgs 0
byte "distribute_remain_shares"
==
bnz main_l14
err
main_l14:
callsub postcreatedistributeshares_12
main_l15:
int 0
return
main_l16:
callsub oncreatedistributeshares_10
b main_l15
main_l17:
callsub oncreatedepositcoins_11
b main_l15
main_l18:
callsub oncreatemintshares_7
b main_l15
main_l19:
callsub oncreatemintcoins_6
b main_l15
main_l20:
callsub oncreateaddfounders_2
b main_l15
main_l21:
int 0
return
main_l22:
int 0
return
main_l23:
int 0
return
main_l24:
int 0
return
main_l25:
callsub oncreate_1
int 1
return

// convert_uint_to_bytes
convertuinttobytes_0:
store 3
load 3
int 0
==
bnz convertuinttobytes_0_l5
byte ""
store 4
load 3
store 5
convertuinttobytes_0_l2:
load 5
int 0
>
bnz convertuinttobytes_0_l4
load 4
b convertuinttobytes_0_l6
convertuinttobytes_0_l4:
load 5
int 10
%
store 6
byte "0123456789"
load 6
load 6
int 1
+
substring3
load 4
concat
store 4
load 5
int 10
/
store 5
b convertuinttobytes_0_l2
convertuinttobytes_0_l5:
byte "0"
convertuinttobytes_0_l6:
retsub

// on_create
oncreate_1:
txn NumAppArgs
int 2
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
byte "number_of_founder(s)"
txna ApplicationArgs 1
btoi
app_global_put
byte "shares_total"
int 0
app_global_put
byte "founders_added"
int 0
app_global_put
retsub

// on_create_add_founders
oncreateaddfounders_2:
byte "number_of_founder(s)"
app_global_get
store 0
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 2
oncreateaddfounders_2_l1:
load 2
int 1
<
bnz oncreateaddfounders_2_l5
byte "founders_added"
app_global_get
int 0
==
txn NumAppArgs
load 0
int 1
+
==
&&
assert
int 1
store 1
oncreateaddfounders_2_l3:
load 1
txn NumAppArgs
<
bz oncreateaddfounders_2_l6
load 1
callsub convertuinttobytes_0
load 1
txnas ApplicationArgs
app_global_put
load 1
int 1
+
store 1
b oncreateaddfounders_2_l3
oncreateaddfounders_2_l5:
load 2
gtxns RekeyTo
global ZeroAddress
==
assert
load 2
int 1
+
store 2
b oncreateaddfounders_2_l1
oncreateaddfounders_2_l6:
byte "founders_added"
int 1
app_global_put
int 1
return

// get_global_value
getglobalvalue_3:
store 17
store 16
load 16
load 17
app_global_get_ex
store 19
store 18
load 18
retsub

// create_tokens
createtokens_4:
store 24
store 23
store 22
store 21
store 20
itxn_begin
load 24
int 1
==
bnz createtokens_4_l2
int acfg
itxn_field TypeEnum
load 20
itxn_field ConfigAssetName
load 21
itxn_field ConfigAssetUnitName
load 22
itxn_field ConfigAssetTotal
load 23
itxn_field ConfigAssetDecimals
int 0
itxn_field ConfigAssetDefaultFrozen
b createtokens_4_l3
createtokens_4_l2:
int acfg
itxn_field TypeEnum
load 20
itxn_field ConfigAssetName
load 21
itxn_field ConfigAssetUnitName
load 22
itxn_field ConfigAssetTotal
load 23
itxn_field ConfigAssetDecimals
int 0
itxn_field ConfigAssetDefaultFrozen
txna Accounts 1
itxn_field ConfigAssetReserve
createtokens_4_l3:
itxn_submit
retsub

// vault_connect_and_optIn_coins
vaultconnectandoptIncoins_5:
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

// on_create_mint_coins
oncreatemintcoins_6:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 15
oncreatemintcoins_6_l1:
load 15
int 1
<
bz oncreatemintcoins_6_l3
load 15
gtxns RekeyTo
global ZeroAddress
==
assert
load 15
int 1
+
store 15
b oncreatemintcoins_6_l1
oncreatemintcoins_6_l3:
txna Applications 1
store 7
txna Accounts 1
store 8
txna ApplicationArgs 1
store 10
txna ApplicationArgs 2
store 11
txna ApplicationArgs 3
btoi
store 12
txna ApplicationArgs 4
btoi
store 13
int 1
store 14
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
load 7
byte "vault_wallet"
callsub getglobalvalue_3
load 8
==
&&
txn NumAppArgs
int 5
==
&&
assert
load 10
load 11
load 12
load 13
load 14
callsub createtokens_4
itxn CreatedAssetID
store 9
load 7
load 9
callsub vaultconnectandoptIncoins_5
byte "coins_id"
load 9
app_global_put
byte "vault_id"
load 7
app_global_put
byte "vault_wallet"
load 8
app_global_put
int 1
return

// on_create_mint_shares
oncreatemintshares_7:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 34
oncreatemintshares_7_l1:
load 34
int 1
<
bz oncreatemintshares_7_l3
load 34
gtxns RekeyTo
global ZeroAddress
==
assert
load 34
int 1
+
store 34
b oncreatemintshares_7_l1
oncreatemintshares_7_l3:
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
int 0
store 33
byte "shares_id"
app_global_get
int 0
==
txn NumAppArgs
int 5
==
&&
assert
load 29
load 30
load 31
load 32
load 33
callsub createtokens_4
itxn CreatedAssetID
store 28
byte "shares_id"
load 28
app_global_put
byte "shares_total"
load 31
app_global_put
int 1
return

// company_send_tokens
companysendtokens_8:
store 42
store 41
store 40
itxn_begin
int axfer
itxn_field TypeEnum
load 40
itxn_field XferAsset
load 42
itxn_field AssetReceiver
load 41
itxn_field AssetAmount
itxn_submit
retsub

// check_assets_holding
checkassetsholding_9:
store 45
store 44
store 43
load 44
load 45
asset_holding_get AssetBalance
store 47
store 46
load 43
byte "sender"
==
load 43
byte "founder"
==
||
bnz checkassetsholding_9_l4
load 43
byte "receiver"
==
bnz checkassetsholding_9_l3
err
checkassetsholding_9_l3:
load 47
b checkassetsholding_9_l5
checkassetsholding_9_l4:
load 46
checkassetsholding_9_l5:
retsub

// on_create_distribute_shares
oncreatedistributeshares_10:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 39
oncreatedistributeshares_10_l1:
load 39
int 1
<
bnz oncreatedistributeshares_10_l11
int 0
store 36
txna Assets 0
store 35
byte "sender"
global CurrentApplicationAddress
load 35
callsub checkassetsholding_9
store 37
txn NumAccounts
int 1
+
store 38
oncreatedistributeshares_10_l3:
load 38
txn NumAccounts
int 2
*
<=
bnz oncreatedistributeshares_10_l10
load 35
byte "shares_id"
app_global_get
==
load 37
load 36
>=
&&
txn NumAppArgs
txn NumAccounts
int 2
*
int 1
+
==
&&
assert
int 1
store 38
oncreatedistributeshares_10_l5:
load 38
txn NumAccounts
<=
bnz oncreatedistributeshares_10_l9
int 1
store 38
oncreatedistributeshares_10_l7:
load 38
txn NumAccounts
<=
bz oncreatedistributeshares_10_l12
load 35
load 38
txn NumAccounts
+
txnas ApplicationArgs
btoi
load 38
txnas Accounts
callsub companysendtokens_8
load 38
int 1
+
store 38
b oncreatedistributeshares_10_l7
oncreatedistributeshares_10_l9:
load 38
txnas ApplicationArgs
app_global_get
load 38
txnas Accounts
==
assert
byte "founder"
load 38
txnas Accounts
load 35
callsub checkassetsholding_9
int 0
==
assert
load 38
int 1
+
store 38
b oncreatedistributeshares_10_l5
oncreatedistributeshares_10_l10:
load 36
load 38
txnas ApplicationArgs
btoi
+
store 36
load 38
int 1
+
store 38
b oncreatedistributeshares_10_l3
oncreatedistributeshares_10_l11:
load 39
gtxns RekeyTo
global ZeroAddress
==
assert
load 39
int 1
+
store 39
b oncreatedistributeshares_10_l1
oncreatedistributeshares_10_l12:
int 1
return

// on_create_deposit_coins
oncreatedepositcoins_11:
txna Accounts 1
store 48
txna Assets 0
store 49
byte "sender"
global CurrentApplicationAddress
load 49
callsub checkassetsholding_9
store 50
byte "coins_id"
app_global_get
load 49
==
byte "vault_wallet"
app_global_get
load 48
==
&&
byte "receiver"
load 48
load 49
callsub checkassetsholding_9
&&
load 50
int 0
>=
&&
txn NumAppArgs
int 1
==
&&
assert
load 49
load 50
load 48
callsub companysendtokens_8
int 1
return

// post_create_distribute_shares
postcreatedistributeshares_12:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 55
postcreatedistributeshares_12_l1:
load 55
int 1
<
bz postcreatedistributeshares_12_l3
load 55
gtxns RekeyTo
global ZeroAddress
==
assert
load 55
int 1
+
store 55
b postcreatedistributeshares_12_l1
postcreatedistributeshares_12_l3:
txna Accounts 1
store 51
txna ApplicationArgs 1
btoi
store 53
txna Assets 0
store 52
byte "sender"
global CurrentApplicationAddress
load 52
callsub checkassetsholding_9
store 54
load 52
byte "shares_id"
app_global_get
==
load 54
load 53
>=
&&
byte "receiver"
load 51
load 52
callsub checkassetsholding_9
&&
txn NumAppArgs
int 2
==
&&
assert
load 52
load 53
load 51
callsub companysendtokens_8
int 1
return
`;

export default createCompany;