// Public surface of the Aisle agent.
//
//   runAgent({state})  →  discovery, collection, matching, verification and a
//                         basket, with the evidence behind every figure.
//
// Everything the interface needs is on the returned AgentRun. Nothing in here
// produces a price that is not backed by an EvidenceLedger row.
export {runAgent,type AgentRun,type RunOptions,type TraceStep,type Phase} from './orchestrator';
export {buildShopperModel,brandNudge,cadenceDays,perShopBudget,type ShopperModel,type Replenishment,type Affinity} from './memory';
export {EvidenceLedger,faultsOf,isTrustworthy,verifiedOffers,sha256,type Evidence,type SourcedOffer,type OfferFault} from './provenance';
export {TOOLS,toolByName,toolSchemasForModel,computeBaskets,basketsFrom,type Tool,type ToolContext,type Basket,type BasketLine,type BasketInput,type Proposal,type Budget} from './tools';
export {AGENT_SYSTEM_PROMPT,reviewNarrative,reviewRationale,allowedFigures,allowedDistances,type Violation} from './policy';
export {brokerConfig,runToolLoop,type BrokerConfig,type LoopEvent,type LoopOutcome} from './model';
export {CHAINS,chainFor,inOntario,SEEDED_ORIGINS,ONTARIO_BOUNDS,type ChainPolicy,type FeedPolicy} from './registry';
export {discoverStores,feedCandidates,probeFeeds,coverageGaps,type DiscoveredStore,type FeedCandidate,type ProbeReport} from './discovery';
export {ADAPTERS,shopifyAdapter,adapterById,type Adapter,type ProbeVerdict,type CollectOutcome} from './adapters';
export {OriginGuard,createReader,safeHost,assertReadable,type Reader,type ReadResult} from './net';

// The existing bounded pipeline stays available and unchanged.
export {buildPlan,matchOffer,requiredPacks,type AgentPlan} from './engine';
export {collectSource,normalizeProducts,parsePack,robotsDisallows,blockedByRobots} from './collector';
export {collectPlaces,nearbyPlaces,placeArea,distanceKm,type GroceryPlace,type PlaceResult} from './places';
export {SOURCES,type Offer,type MarketSnapshot,type SourceResult,type Pack} from './types';
