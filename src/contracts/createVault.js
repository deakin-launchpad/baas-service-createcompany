const createVault = `#pragma version 8
txn ApplicationID
int 0
==
bnz main_l14
txn OnCompletion
int DeleteApplication
==
bnz main_l13
txn OnCompletion
int UpdateApplication
==
bnz main_l12
txn OnCompletion
int OptIn
==
bnz main_l11
txn OnCompletion
int CloseOut
==
bnz main_l10
txn OnCompletion
int NoOp
==
bnz main_l7
err
main_l7:
txna ApplicationArgs 0
byte "connect_company_and_optIn_to_coins"
==
bnz main_l9
err
main_l9:
callsub acceptcompanyandoptIncoins_2
int 0
return
main_l10:
int 0
return
main_l11:
int 0
return
main_l12:
int 0
return
main_l13:
int 0
return
main_l14:
callsub oncreate_0
int 1
return

// on_create
oncreate_0:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
txn NumAppArgs
int 1
==
assert
byte "vault_name"
txna ApplicationArgs 0
app_global_put
byte "vault_wallet"
global CurrentApplicationAddress
app_global_put
byte "company_id"
int 0
app_global_put
byte "company_wallet"
byte ""
app_global_put
byte "coins_id"
int 0
app_global_put
int 1
return

// optIn_assets
optInassets_1:
store 4
itxn_begin
int axfer
itxn_field TypeEnum
load 4
itxn_field XferAsset
global CurrentApplicationAddress
itxn_field AssetReceiver
int 0
itxn_field AssetAmount
itxn_submit
retsub

// accept_company_and_optIn_coins
acceptcompanyandoptIncoins_2:
global GroupSize
int 1
==
txn GroupIndex
int 0
==
&&
assert
int 0
store 3
acceptcompanyandoptIncoins_2_l1:
load 3
int 1
<
bz acceptcompanyandoptIncoins_2_l3
load 3
gtxns RekeyTo
global ZeroAddress
==
assert
load 3
int 1
+
store 3
b acceptcompanyandoptIncoins_2_l1
acceptcompanyandoptIncoins_2_l3:
txn Sender
store 0
txna Applications 1
store 1
txna Assets 0
store 2
byte "company_id"
app_global_get
int 0
==
byte "company_wallet"
app_global_get
byte ""
==
&&
byte "coins_id"
app_global_get
int 0
==
&&
txn NumAppArgs
int 1
==
&&
assert
byte "company_id"
load 1
app_global_put
byte "company_wallet"
load 0
app_global_put
load 2
callsub optInassets_1
byte "coins_id"
load 2
app_global_put
int 1
return`
;
export default createVault;
