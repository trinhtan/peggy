package rest

import (
	"net/http"
	"strconv"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/types/rest"
	"github.com/cosmos/cosmos-sdk/x/auth/client/utils"

	"github.com/trinhtan/peggy/x/ethbridge/types"

	sdk "github.com/cosmos/cosmos-sdk/types"
)

type createEthClaimReq struct {
	BaseReq               rest.BaseReq `json:"base_req"`
	EthereumChainID       int          `json:"ethereum_chain_id"`
	BridgeContractAddress string       `json:"bridge_registry_contract_address"`
	Nonce                 int          `json:"nonce"`
	Symbol                string       `json:"symbol"`
	TokenContractAddress  string       `json:"token_contract_address"`
	EthereumSender        string       `json:"ethereum_sender"`
	CosmosReceiver        string       `json:"cosmos_receiver"`
	Validator             string       `json:"validator"`
	Amount                int64        `json:"amount"`
	ClaimType             string       `json:"claim_type"`
}

type burnOrLockEthReq struct {
	BaseReq          rest.BaseReq `json:"base_req"`
	EthereumChainID  string       `json:"ethereum_chain_id"`
	TokenContract    string       `json:"token_contract_address"`
	CosmosSender     string       `json:"cosmos_sender"`
	EthereumReceiver string       `json:"ethereum_receiver"`
	Amount           int64        `json:"amount"`
	Symbol           string       `json:"symbol"`
}

func createClaimHandler(cliCtx context.CLIContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req createEthClaimReq

		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}

		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}

		bridgeContractAddress := types.NewEthereumAddress(req.BridgeContractAddress)

		tokenContractAddress := types.NewEthereumAddress(req.TokenContractAddress)

		ethereumSender := types.NewEthereumAddress(req.EthereumSender)

		cosmosReceiver, err := sdk.AccAddressFromBech32(req.CosmosReceiver)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}
		validator, err := sdk.ValAddressFromBech32(req.Validator)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		claimType, err := types.StringToClaimType(req.ClaimType)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, types.ErrInvalidClaimType.Error())
			return
		}

		// create the message
		ethBridgeClaim := types.NewEthBridgeClaim(
			req.EthereumChainID, bridgeContractAddress, req.Nonce, req.Symbol,
			tokenContractAddress, ethereumSender, cosmosReceiver, validator, req.Amount, claimType)
		msg := types.NewMsgCreateEthBridgeClaim(ethBridgeClaim)
		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}

func burnOrLockHandler(cliCtx context.CLIContext, lockOrBurn string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req burnOrLockEthReq

		if !rest.ReadRESTReq(w, r, cliCtx.Codec, &req) {
			rest.WriteErrorResponse(w, http.StatusBadRequest, "failed to parse request")
			return
		}

		baseReq := req.BaseReq.Sanitize()
		if !baseReq.ValidateBasic(w) {
			return
		}

		ethereumChainID, err := strconv.Atoi(req.EthereumChainID)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}

		cosmosSender, err := sdk.AccAddressFromBech32(req.CosmosSender)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		ethereumReceiver := types.NewEthereumAddress(req.EthereumReceiver)

		// create the message
		var msg sdk.Msg
		switch lockOrBurn {
		case "lock":
			msg = types.NewMsgLock(ethereumChainID, cosmosSender, ethereumReceiver, req.Amount, req.Symbol)
		case "burn":
			msg = types.NewMsgBurn(ethereumChainID, cosmosSender, ethereumReceiver, req.Amount, req.Symbol)
		}
		err = msg.ValidateBasic()
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusBadRequest, err.Error())
			return
		}

		utils.WriteGenerateStdTxResponse(w, cliCtx, baseReq, []sdk.Msg{msg})
	}
}
