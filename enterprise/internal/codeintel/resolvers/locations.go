package resolvers

import (
	"github.com/sourcegraph/go-lsp"
	codeintelapi "github.com/sourcegraph/sourcegraph/enterprise/internal/codeintel/api"
	"github.com/sourcegraph/sourcegraph/internal/api"
	bundles "github.com/sourcegraph/sourcegraph/internal/codeintel/bundles/client"
	"github.com/sourcegraph/sourcegraph/internal/lsif"
)

type APILocation struct {
	RepositoryID int           `json:"repositoryId"`
	Commit       string        `json:"commit"`
	Path         string        `json:"path"`
	Range        bundles.Range `json:"range"`
}

func serializeLocations(resolvedLocations []codeintelapi.ResolvedLocation) []lsif.LSIFLocation {
	var apiLocations []lsif.LSIFLocation
	for _, res := range resolvedLocations {
		apiLocations = append(apiLocations, lsif.LSIFLocation{
			RepositoryID: api.RepoID(res.Dump.RepositoryID),
			Commit:       res.Dump.Commit,
			Path:         res.Path,
			Range: lsp.Range{
				Start: lsp.Position{Line: res.Range.Start.Line, Character: res.Range.Start.Character},
				End:   lsp.Position{Line: res.Range.End.Line, Character: res.Range.End.Character},
			},
		})
	}

	return apiLocations
}
