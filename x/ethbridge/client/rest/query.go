package rest

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/cosmos/cosmos-sdk/client/context"
	"github.com/cosmos/cosmos-sdk/types/rest"

	"github.com/gorilla/mux"

	"github.com/trinhtan/peggy/x/ethbridge/types"
)

func getProphecyHandler(cliCtx context.CLIContext, storeName string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		vars := mux.Vars(r)

		ethereumChainID := vars[restEthereumChainID]
		ethereumChainIDString, err := strconv.Atoi(ethereumChainID)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}

		bridgeContract := types.NewEthereumAddress(vars[restBridgeContract])

		nonce := vars[restNonce]
		nonceString, err := strconv.Atoi(nonce)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusInternalServerError, err.Error())
			return
		}

		tokenContract := types.NewEthereumAddress(vars[restTokenContract])

		symbol := vars[restSymbol]
		if strings.TrimSpace(symbol) == "" {
			rest.WriteErrorResponse(w, http.StatusInternalServerError, "symbol is empty")
			return
		}

		ethereumSender := types.NewEthereumAddress(vars[restEthereumSender])

		bz, err := cliCtx.Codec.MarshalJSON(
			types.NewQueryEthProphecyParams(
				ethereumChainIDString, bridgeContract, nonceString, symbol, tokenContract, ethereumSender))
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}

		route := fmt.Sprintf("custom/%s/%s", storeName, types.QueryEthProphecy)
		res, _, err := cliCtx.QueryWithData(route, bz)
		if err != nil {
			rest.WriteErrorResponse(w, http.StatusNotFound, err.Error())
			return
		}

		rest.PostProcessResponse(w, cliCtx, res)
	}
}
