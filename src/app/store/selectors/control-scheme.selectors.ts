import { createFeatureSelector, createSelector } from '@ngrx/store';
import { HubType, IOType } from '@nvsukhanov/rxpoweredup';
import { Dictionary } from '@ngrx/entity';

import {
    AttachedIO,
    AttachedVirtualIO,
    ControlScheme,
    ControlSchemeBinding,
    Controller,
    HubConfiguration,
    HubIoSupportedModes,
    HubStats,
    IState,
    PortModeInfo,
    PortType
} from '../i-state';
import { CONTROL_SCHEMES_ENTITY_ADAPTER, controllerInputIdFn, hubAttachedIosIdFn } from '../entity-adapters';
import { HUB_PORT_TASKS_SELECTORS } from './hub-port-tasks.selectors';
import { HUB_ATTACHED_IO_SELECTORS, getHubIOOperationModes } from './hub-attached-io.selectors';
import { HUB_IO_SUPPORTED_MODES_SELECTORS } from './hub-io-supported-modes.selectors';
import { HUB_PORT_MODE_INFO_SELECTORS } from './hub-port-mode-info.selectors';
import { CONTROL_SCHEME_RUNNING_STATE_SELECTORS } from './control-scheme-running-state.selectors';
import { ROUTER_SELECTORS } from './router.selectors';
import { CONTROLLER_SELECTORS } from './controllers.selectors';
import { CONTROLLER_INPUT_SELECTORS } from './controller-input.selectors';
import { HubIoOperationMode } from '../hub-io-operation-mode';
import { HUBS_SELECTORS } from './hubs.selectors';
import { ControllerInputType } from '../controller-input-type';
import { HUB_STATS_SELECTORS } from './hub-stats.selectors';

const CONTROL_SCHEME_FEATURE_SELECTOR = createFeatureSelector<IState['controlSchemes']>('controlSchemes');

const CONTROL_SCHEME_ENTITY_SELECTORS = CONTROL_SCHEMES_ENTITY_ADAPTER.getSelectors();

const CONTROL_SCHEME_SELECT_ENTITIES = createSelector(
    CONTROL_SCHEME_FEATURE_SELECTOR,
    CONTROL_SCHEME_ENTITY_SELECTORS.selectEntities
);

const CONTROL_SCHEME_SELECT_ALL = createSelector(
    CONTROL_SCHEME_FEATURE_SELECTOR,
    CONTROL_SCHEME_ENTITY_SELECTORS.selectAll
);

function createHubTreeNode(
    hubConfig: HubConfiguration,
    hubStats?: HubStats,
): ControlSchemeViewHubTreeNode {
    return {
        path: hubConfig.hubId,
        hubId: hubConfig.hubId,
        name: hubConfig.name,
        batteryLevel: hubStats?.batteryLevel ?? null,
        RSSI: hubStats?.RSSI ?? null,
        hubType: hubConfig.hubType,
        isButtonPressed: hubStats?.isButtonPressed ?? false,
        hasCommunication: hubStats?.hasCommunication ?? false,
        nodeType: ControlSchemeNodeTypes.Hub,
        isConnected: !!hubStats,
        children: []
    };
}

function createIOTreeNode(
    parentPath: string,
    hubConfig: HubConfiguration,
    isHubConnected: boolean,
    iosEntities: Dictionary<AttachedIO>,
    portId: number,
): ControlSchemeViewIOTreeNode {
    const ioId = hubAttachedIosIdFn({ hubId: hubConfig.hubId, portId });
    const io = iosEntities[ioId];

    return {
        path: `${parentPath}.${portId}`,
        nodeType: ControlSchemeNodeTypes.IO,
        portId: portId,
        ioType: io?.ioType ?? null,
        isConnected: isHubConnected && !!io,
        children: []
    };
}

function createBindingTreeNode(
    ioPath: string,
    binding: ControlSchemeBinding,
    ioSupportedModesEntities: Dictionary<HubIoSupportedModes>,
    portModeInfoEntities: Dictionary<PortModeInfo>,
    controllerEntities: Dictionary<Controller>,
    lastExecutedTasksBindingIds: ReadonlySet<string>,
    io?: AttachedIO,
): ControlSchemeViewBindingTreeNode {
    let ioHasNoRequiredCapabilities = false;
    if (io) {
        const ioOperationModes = getHubIOOperationModes(
            io,
            ioSupportedModesEntities,
            portModeInfoEntities,
            binding.input.inputType
        );
        ioHasNoRequiredCapabilities = !ioOperationModes.includes(binding.output.operationMode);
    }
    return {
        path: `${ioPath}.${binding.id}`,
        nodeType: ControlSchemeNodeTypes.Binding,
        controller: controllerEntities[binding.input.controllerId],
        inputId: binding.input.inputId,
        inputType: binding.input.inputType,
        isActive: lastExecutedTasksBindingIds.has(binding.id),
        operationMode: binding.output.operationMode,
        ioHasNoRequiredCapabilities,
        children: []
    };
}

export enum ControlSchemeNodeTypes {
    Hub = 'Hub',
    IO = 'IO',
    Binding = 'Binding',
    VirtualPort = 'Virtual port'
}

export type ControlSchemeViewBindingTreeNode = {
    readonly path: string;
    readonly nodeType: ControlSchemeNodeTypes.Binding;
    readonly controller?: Controller;
    readonly inputId: string;
    readonly inputType: ControllerInputType;
    readonly isActive: boolean;
    readonly operationMode: HubIoOperationMode;
    readonly ioHasNoRequiredCapabilities: boolean;
    readonly children: [];
}

export type ControlSchemeViewIOTreeNode = {
    readonly path: string;
    readonly nodeType: ControlSchemeNodeTypes.IO;
    readonly portId: number;
    readonly ioType: IOType | null;
    readonly isConnected: boolean;
    readonly children: ControlSchemeViewBindingTreeNode[];
}

export type ControlSchemeViewVirtualPortTreeNode = {
    readonly path: string;
    readonly name: string;
    readonly nodeType: ControlSchemeNodeTypes.VirtualPort;
    readonly expectedIOTypes: [ IOType, IOType ];
    readonly children: [ ControlSchemeViewIOTreeNode, ControlSchemeViewIOTreeNode ];
}

export type ControlSchemeViewHubTreeNode = {
    readonly path: string;
    readonly nodeType: ControlSchemeNodeTypes.Hub;
    readonly hubId: string;
    readonly name: string;
    readonly batteryLevel: number | null;
    readonly RSSI: number | null;
    readonly hubType: HubType;
    readonly isButtonPressed: boolean;
    readonly hasCommunication: boolean;
    readonly isConnected: boolean;
    readonly children: Array<ControlSchemeViewIOTreeNode | ControlSchemeViewVirtualPortTreeNode>;
};

export type HubWithSynchronizableIOs = {
    hubId: string;
    hubName: string;
    synchronizableIOs: AttachedIO[];
}

export type ControlSchemeViewTreeNode = ControlSchemeViewHubTreeNode
    | ControlSchemeViewIOTreeNode
    | ControlSchemeViewBindingTreeNode
    | ControlSchemeViewVirtualPortTreeNode;

export const CONTROL_SCHEME_SELECTORS = {
    selectAll: CONTROL_SCHEME_SELECT_ALL,
    selectEntities: createSelector(CONTROL_SCHEME_FEATURE_SELECTOR, CONTROL_SCHEME_ENTITY_SELECTORS.selectEntities),
    selectSchemesList: createSelector(
        CONTROL_SCHEME_SELECT_ALL,
        CONTROL_SCHEME_RUNNING_STATE_SELECTORS.selectRunningSchemeId,
        (
            schemes,
            runningSchemeId
        ) => {
            return schemes.map((scheme) => ({
                ...scheme,
                isRunning: scheme.id === runningSchemeId
            }));
        }
    ),
    selectSchemesCount: createSelector(CONTROL_SCHEME_FEATURE_SELECTOR, CONTROL_SCHEME_ENTITY_SELECTORS.selectTotal),
    selectScheme: (id: string) => createSelector(CONTROL_SCHEME_SELECT_ENTITIES, (state) => state[id]),
    selectSchemeBindingInputValue: (
        schemeId: string,
        binding: ControlSchemeBinding
    ) => createSelector(
        CONTROL_SCHEME_SELECTORS.selectScheme(schemeId),
        CONTROLLER_INPUT_SELECTORS.selectEntities,
        (scheme, inputEntities) => {
            if (!scheme || !inputEntities) {
                return 0;
            }
            const input = inputEntities[controllerInputIdFn(binding.input)];
            return input ? input.value : 0;
        }
    ),
    canRunScheme: (schemeId: string) => createSelector( // TODO: performance-wise, this selector is not optimal (should not use viewTree)
        CONTROL_SCHEME_SELECTORS.schemeViewTree(schemeId),
        CONTROL_SCHEME_RUNNING_STATE_SELECTORS.selectRunningSchemeId,
        (
            viewTree,
            runningSchemeId
        ): boolean => {
            let allHubAreConnected = true;
            let allIOsAreConnected = true;
            let allIOsTypesMatches = true;
            if (runningSchemeId !== null) {
                return false;
            }
            viewTree.forEach((hubNode) => {
                allHubAreConnected = allHubAreConnected && hubNode.isConnected;
                hubNode.children.forEach((ioNode) => {
                    if (ioNode.nodeType === ControlSchemeNodeTypes.VirtualPort) {
                        allIOsAreConnected = allIOsAreConnected && ioNode.children.every((c) => c.isConnected);
                        allIOsTypesMatches = allIOsTypesMatches
                            && ioNode.children[0].ioType === ioNode.expectedIOTypes[0]
                            && ioNode.children[1].ioType === ioNode.expectedIOTypes[1];
                    } else {
                        allIOsAreConnected = allIOsAreConnected && ioNode.isConnected;
                        allIOsTypesMatches = allIOsTypesMatches && ioNode.children.every((c) => !c.ioHasNoRequiredCapabilities);
                    }
                });
            });
            return allHubAreConnected && allIOsAreConnected && allIOsTypesMatches;
        }
    ),
    schemeViewTree: (schemeId: string) => createSelector(
        CONTROL_SCHEME_SELECTORS.selectScheme(schemeId),
        HUBS_SELECTORS.selectHubEntities,
        HUB_STATS_SELECTORS.selectEntities,
        HUB_ATTACHED_IO_SELECTORS.selectIOsEntities,
        HUB_IO_SUPPORTED_MODES_SELECTORS.selectIOSupportedModesEntities,
        HUB_PORT_MODE_INFO_SELECTORS.selectEntities,
        CONTROLLER_SELECTORS.selectEntities,
        HUB_PORT_TASKS_SELECTORS.selectLastExecutedBindingIds,
        (
            scheme: ControlScheme | undefined,
            hubEntities: Dictionary<HubConfiguration>,
            statsEntities: Dictionary<HubStats>,
            IOs: Dictionary<AttachedIO>,
            ioSupportedModesEntities: Dictionary<HubIoSupportedModes>,
            portModeInfoEntities: Dictionary<PortModeInfo>,
            controllerEntities: Dictionary<Controller>,
            lastExecutedTasksBindingIds: ReadonlySet<string>
        ): ControlSchemeViewHubTreeNode[] => {
            if (!scheme) {
                return [];
            }
            const hubsViewMap = new Map<string, ControlSchemeViewHubTreeNode>();

            function ensureHubNodeCreated(
                hubConfiguration: HubConfiguration
            ): ControlSchemeViewHubTreeNode {
                let hubTreeNode = hubsViewMap.get(hubConfiguration.hubId);
                if (!hubTreeNode) {
                    hubTreeNode = createHubTreeNode(
                        hubConfiguration,
                        statsEntities[hubConfiguration.hubId],
                    );
                    hubsViewMap.set(hubConfiguration.hubId, hubTreeNode);
                }
                return hubTreeNode;
            }

            [ ...scheme.virtualPorts ].sort((a, b) => a.portIdA - b.portIdA).forEach((virtualPort) => {
                const hubConfig = hubEntities[virtualPort.hubId];
                if (!hubConfig) {
                    return;
                }
                const hubNode = ensureHubNodeCreated(hubConfig);
                const ioNodeA = createIOTreeNode(
                    `${hubNode.path}.virtualPort/${virtualPort.portIdA}`,
                    hubConfig,
                    !!statsEntities[hubConfig.hubId],
                    IOs,
                    virtualPort.portIdA
                );
                const ioNodeB = createIOTreeNode(
                    `${hubNode.path}.virtualPort/${virtualPort.portIdB}`,
                    hubConfig,
                    !!statsEntities[hubConfig.hubId],
                    IOs,
                    virtualPort.portIdB
                );

                const virtualPortNode: ControlSchemeViewVirtualPortTreeNode = {
                    path: `${hubNode.path}.${virtualPort.name}`,
                    name: virtualPort.name,
                    nodeType: ControlSchemeNodeTypes.VirtualPort,
                    expectedIOTypes: [ virtualPort.ioAType, virtualPort.ioBType ],
                    children: [
                        ioNodeA,
                        ioNodeB
                    ]
                };
                hubNode.children.push(virtualPortNode);
            });

            const hubIOsViewMap = new Map<string, ControlSchemeViewIOTreeNode>();
            [ ...scheme.bindings ].sort((a, b) => a.output.portId - b.output.portId).forEach((binding) => {
                const hubConfig = hubEntities[binding.output.hubId];
                if (!hubConfig) {
                    return;
                }
                const ioId = hubAttachedIosIdFn({ hubId: hubConfig.hubId, portId: binding.output.portId });

                let ioViewModel = hubIOsViewMap.get(ioId);
                if (!ioViewModel) {
                    const hubTreeNode = ensureHubNodeCreated(hubConfig);
                    ioViewModel = createIOTreeNode(
                        hubTreeNode.path,
                        hubConfig,
                        !!statsEntities[hubConfig.hubId],
                        IOs,
                        binding.output.portId
                    );
                    hubIOsViewMap.set(ioId, ioViewModel);

                    hubTreeNode.children.push(ioViewModel);
                }

                const io = IOs[hubAttachedIosIdFn(binding.output)];
                const bindingTreeNode = createBindingTreeNode(
                    ioViewModel.path,
                    binding,
                    ioSupportedModesEntities,
                    portModeInfoEntities,
                    controllerEntities,
                    lastExecutedTasksBindingIds,
                    io
                );

                ioViewModel.children.push(bindingTreeNode);
            });
            return [ ...hubsViewMap.values() ];
        }
    ),
    isCurrentControlSchemeRunning: createSelector(
        CONTROL_SCHEME_RUNNING_STATE_SELECTORS.selectRunningSchemeId,
        ROUTER_SELECTORS.selectRouteParam('id'),
        (
            runningSchemeId,
            schemeId
        ) => runningSchemeId !== null && runningSchemeId === schemeId
    ),
    selectHubsWithSynchronizableIOs: createSelector(
        HUBS_SELECTORS.selectHubEntities,
        HUB_ATTACHED_IO_SELECTORS.selectFullIOsInfo,
        (hubEntities, ios): HubWithSynchronizableIOs[] => {
            const hubWithSynchronizableIOsMap = new Map<string, HubWithSynchronizableIOs>();
            ios.filter((io) => io.synchronizable)
               .forEach((io) => {
                   const hub = hubEntities[io.hubId];
                   if (!hub) {
                       return;
                   }
                   const existing = hubWithSynchronizableIOsMap.get(io.hubId);
                   if (existing) {
                       existing.synchronizableIOs.push(io);
                   } else {
                       hubWithSynchronizableIOsMap.set(hub.hubId, {
                           hubId: hub.hubId,
                           hubName: hub.name,
                           synchronizableIOs: [ io ]
                       });
                   }
               });
            return [ ...hubWithSynchronizableIOsMap.values() ].filter((h) => h.synchronizableIOs.length > 1);
        }
    ),
    selectVirtualPortsOfSchemeRelatedHubs: (schemeId: string) => createSelector(
        CONTROL_SCHEME_SELECTORS.selectScheme(schemeId),
        HUB_ATTACHED_IO_SELECTORS.selectHubIOsByPortType(PortType.Virtual),
        (scheme, virtualIOs): AttachedVirtualIO[] => {
            const virtualIoMap = new Map<string, AttachedVirtualIO>();
            virtualIOs.forEach((io) => {
                virtualIoMap.set(`${io.hubId}/${io.portIdA}/${io.portIdB}`, io);
            });
            if (!scheme) {
                return [];
            }
            return scheme.virtualPorts.map((vp) => virtualIoMap.get(`${vp.hubId}/${vp.portIdA}/${vp.portIdB}`))
                         .filter((v) => !!v) as AttachedVirtualIO[];
        }
    ),
    selectSchemeVirtualPortConfigs: (schemeId: string) => createSelector(
        CONTROL_SCHEME_SELECTORS.selectScheme(schemeId),
        (scheme) => scheme?.virtualPorts ?? []
    ),
    areAllNecessaryVirtualPortsCreated: (schemeId: string) => createSelector(
        HUB_ATTACHED_IO_SELECTORS.selectIOsAll,
        CONTROL_SCHEME_SELECTORS.selectSchemeVirtualPortConfigs(schemeId),
        (ios, virtualPortConfigs) => {
            return virtualPortConfigs.every((config) => // TODO: ineffective, but it's not a problem for now
                !!ios.find((io) => io.portType === PortType.Virtual && io.portIdA === config.portIdA && io.portIdB === config.portIdB)
            );
        }
    ),
} as const;
