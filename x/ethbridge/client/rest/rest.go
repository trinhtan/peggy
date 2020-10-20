package rest

import (
	"fmt"

	"github.com/cosmos/cosmos-sdk/client/context"

	"github.com/gorilla/mux"
)

const (
	restEthereumChainID = "ethereumChainID"
	restBridgeContract  = "bridgeContract"
	restNonce           = "nonce"
	restSymbol          = "symbol"
	restTokenContract   = "tokenContract"
	restEthereumSender  = "ethereumSender"
)

// RegisterRESTRoutes - Central function to define routes that get registered by the main application
func RegisterRESTRoutes(cliCtx context.CLIContext, r *mux.Router, storeName string) {
	r.HandleFunc(fmt.Sprintf("/%s/prophecies", storeName), createClaimHandler(cliCtx)).Methods("POST")
	r.HandleFunc(
		fmt.Sprintf("/%s/prophecies/{%s}/{%s}/{%s}/{%s}/{%s}/{%s}",
			storeName, restEthereumChainID, restBridgeContract, restNonce, restSymbol, restTokenContract, restEthereumSender),
		getProphecyHandler(cliCtx, storeName)).Methods("GET")
	r.HandleFunc(fmt.Sprintf("/%s/burn", storeName), burnOrLockHandler(cliCtx, "burn")).Methods("POST")
	r.HandleFunc(fmt.Sprintf("/%s/lock", storeName), burnOrLockHandler(cliCtx, "lock")).Methods("POST")
}
