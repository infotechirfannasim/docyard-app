import { ThemeContextType } from "@/context/theme-provider";
import { useProcessDefinitionXML, useWorkflowList } from "@/hooks/queries/use-files";
import { WorkFlowDto } from "@/types/api/file-dto";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { ActivityIndicator, Dimensions, Modal, Pressable, ScrollView, TouchableOpacity, View } from "react-native";
import { WebView } from "react-native-webview";
import { ThemedText } from "./themed-text";

type FileWorkflowModalProps = {
    visible: boolean;
    fileId: number;
    theme: ThemeContextType;
    onClose: () => void;
};

function WorkflowViewModal({ workflow, visible, theme, onClose }: { workflow: WorkFlowDto | null; visible: boolean; theme: ThemeContextType; onClose: () => void }) {
    const { data: xmlData, isLoading: isXmlLoading } = useProcessDefinitionXML(workflow?.wfProcessDefId ?? null, visible && !!workflow?.wfProcessDefId);

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}>
                <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
                <View style={{ width: '90%', maxHeight: '80%', backgroundColor: theme.theme.background, borderRadius: 16, overflow: 'hidden' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '30' }}>
                        <ThemedText type="mediumBold">Workflow Details</ThemedText>
                        <Pressable onPress={onClose}><Ionicons name="close-outline" size={22} color={theme.theme.textSecondary} /></Pressable>
                    </View>
                    <ScrollView style={{ paddingHorizontal: 16, paddingVertical: 12 }}>
                        {workflow && (
                            <View style={{ marginBottom: 16, gap: 8 }}>
                                <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                    <ThemedText type="extraExtraSmallBold" style={{ width: 80, color: theme.theme.textSecondary }}>Workflow</ThemedText>
                                    <ThemedText type="extraSmall" style={{ flex: 1, color: theme.theme.text }}>{workflow.wfName}</ThemedText>
                                </View>
                                <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                    <ThemedText type="extraExtraSmallBold" style={{ width: 80, color: theme.theme.textSecondary }}>File Name</ThemedText>
                                    <ThemedText type="extraSmall" style={{ flex: 1, color: theme.theme.text }}>{workflow.docName}</ThemedText>
                                </View>
                                <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                    <ThemedText type="extraExtraSmallBold" style={{ width: 80, color: theme.theme.textSecondary }}>Level</ThemedText>
                                    <ThemedText type="extraSmall" style={{ flex: 1, color: theme.theme.text }}>{workflow.wfLevel}</ThemedText>
                                </View>
                                <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                    <ThemedText type="extraExtraSmallBold" style={{ width: 80, color: theme.theme.textSecondary }}>Status</ThemedText>
                                    <ThemedText type="extraSmall" style={{ flex: 1, color: theme.theme.text }}>{workflow.status}</ThemedText>
                                </View>
                                <View style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                    <ThemedText type="extraExtraSmallBold" style={{ width: 80, color: theme.theme.textSecondary }}>Remarks</ThemedText>
                                    <ThemedText type="extraSmall" style={{ flex: 1, color: theme.theme.text }}>{workflow.remarks || '-'}</ThemedText>
                                </View>
                            </View>
                        )}
                        <ThemedText type="smallBold" style={{ color: theme.theme.text, marginBottom: 8 }}>Diagram</ThemedText>
                        {isXmlLoading ? (
                            <View style={{ padding: 40, alignItems: 'center', gap: 8 }}>
                                <ActivityIndicator color={theme.theme.primary} />
                                <ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading diagram...</ThemedText>
                            </View>
                        ) : xmlData?.bpmn20Xml ? (
                            <View style={{ height: 200, overflow: 'hidden', marginBottom: 50 }}>
                                <WebView
                                    originWhitelist={['*']}
                                    javaScriptEnabled={true}
                                    domStorageEnabled={true}
                                    allowFileAccess={true}
                                    allowUniversalAccessFromFileURLs={true}
                                    mixedContentMode="always"
                                    scalesPageToFit={true}
                                    setBuiltInZoomControls={true}
                                    setDisplayZoomControls={false}
                                    source={{ html: `
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <meta charset="utf-8">
                                            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
                                            <style>
                                                * { margin: 0; padding: ; box-sizing: border-box; }
                                                body { background: white;  }
                                                #canvas { width: 100%; height: 100vh; }
                                                .error { color: #e74c3c; padding: 20px; font-family: sans-serif; }
                                                .bjs-powered-by { display: none !important; }
                                                .bjs-breadcrumb { display: none !important; }
                                            </style>
                                        </head>
                                        <body>
                                            <div id="canvas"></div>
                                            <script src="https://unpkg.com/bpmn-js@17.9.1/dist/bpmn-viewer.production.min.js"></script>
                                            <script src="https://cdn.jsdelivr.net/npm/bpmn-js@17.9.1/dist/bpmn-viewer.production.min.js" onerror="this.remove()"></script>
                                            <script>
                                                (function() {
                                                    var xml = ${JSON.stringify(xmlData.bpmn20Xml)};
                                                    var attempts = 0;
                                                    function render() {
                                                        attempts++;
                                                        var Bpmn = window.BpmnViewer || window.BpmnJS;
                                                        if (!Bpmn && attempts < 20) {
                                                            setTimeout(render, 300);
                                                            return;
                                                        }
                                                        if (!Bpmn) {
                                                             document.getElementById('canvas').innerHTML = '<div class="error">Failed to load BPMN library</div>';
                                                             return;
                                                        }
                                                        try {
                                                            var viewer = new Bpmn({ container: '#canvas' });
                                                                 viewer.importXML(xml).then(function() {
                                                                 var canvas = viewer.get('canvas');
                                                                 canvas.resized();
                                                                var bbox = viewer.get('elementRegistry').getAll().reduce(function(b, el) {
                                                                    if (el.x != null) { b.minX = Math.min(b.minX, el.x); b.maxX = Math.max(b.maxX, el.x + (el.width || 0)); }
                                                                    if (el.y != null) { b.minY = Math.min(b.minY, el.y); b.maxY = Math.max(b.maxY, el.y + (el.height || 0)); }
                                                                    return b;
                                                                }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
                                                                var pad = 40;
                                                                bbox.minX -= pad; bbox.minY -= pad; bbox.maxX += pad; bbox.maxY += pad;
                                                                var cw = bbox.maxX - bbox.minX, ch = bbox.maxY - bbox.minY;
                                                                var ow = canvas.viewbox().outer.width, oh = canvas.viewbox().outer.height;
                                                                var scale = Math.min(ow / cw, oh / ch, 1.5);
                                                                canvas.viewbox({
                                                                    x: bbox.minX + cw / 2 - ow / scale / 2,
                                                                    y: bbox.minY + ch / 2 - oh / scale / 2,
                                                                    width: ow / scale,
                                                                    height: oh / scale
                                                                });
                                                             }).catch(function(err) {
                                                                 document.getElementById('canvas').innerHTML = '<div class="error">Render failed: ' + (err.message || err) + '</div>';
                                                             });
                                                        } catch(e) {
                                                            document.getElementById('canvas').innerHTML = '<div class="error">Error: ' + e.message + '</div>';
                                                        }
                                                    }
                                                    setTimeout(render, 500);
                                                })();
                                            </script>
                                        </body>
                                        </html>
                                    ` }}
                                    style={{ flex: 1 }}
                                />
                            </View>
                        ) : (
                            <ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>No diagram available</ThemedText>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

export function FileWorkflowModal({ visible, fileId, theme, onClose }: FileWorkflowModalProps) {
    const { data: workflows, isLoading } = useWorkflowList(fileId);
    const [tableScrollX, setTableScrollX] = useState(0);
    const [tableScrollW, setTableScrollW] = useState(0);
    const [tableVisibleW, setTableVisibleW] = useState(0);
    const [viewingWorkflow, setViewingWorkflow] = useState<WorkFlowDto | null>(null);
    const screenHeight = Dimensions.get('window').height;
    const modalHeight = screenHeight * 0.65;

    return (
        <>
            <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000060' }}>
                    <Pressable style={{ position: 'absolute', inset: 0 }} onPress={onClose} />
                    <View style={{ width: '90%', height: modalHeight, backgroundColor: theme.theme.background, borderRadius: 16, overflow: 'hidden' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '30' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Ionicons name="git-branch-outline" size={20} color={theme.theme.primary} />
                                <ThemedText type="mediumBold">Workflow</ThemedText>
                            </View>
                            <Pressable onPress={onClose}><Ionicons name="close-outline" size={22} color={theme.theme.textSecondary} /></Pressable>
                        </View>

                        {isLoading ? (
                            <View style={{ padding: 40, alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>Loading...</ThemedText></View>
                        ) : !workflows?.length ? (
                            <View style={{ padding: 40, alignItems: 'center' }}><ThemedText type="extraSmall" style={{ color: theme.theme.textSecondary }}>No workflow history</ThemedText></View>
                        ) : (
                            <View style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 12 }}>
                                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={true}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                        onScroll={(e) => setTableScrollX(e.nativeEvent.contentOffset.x)}
                                        onContentSizeChange={(w) => setTableScrollW(w)}
                                        onLayout={(e) => setTableVisibleW(e.nativeEvent.layout.width)}
                                        scrollEventThrottle={16}
                                    >
                                        <View style={{ minWidth: 450 }}>
                                            <View style={{ flexDirection: 'row', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: theme.theme.textSecondary + '20' }}>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 120, color: theme.theme.textSecondary, paddingLeft: 10 }}>Workflow</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 80, color: theme.theme.textSecondary, paddingLeft: 10 }}>Date</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 120, color: theme.theme.textSecondary, paddingLeft: 10 }}>Level</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 100, color: theme.theme.textSecondary, paddingLeft: 10 }}>Performed By</ThemedText>
                                                <ThemedText type="extraExtraSmallBold" style={{ width: 60, color: theme.theme.textSecondary, textAlign: 'center', paddingLeft: 10 }}>Actions</ThemedText>
                                            </View>
                                            {workflows.map((w) => (
                                                <View key={w.id} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: theme.theme.textSecondary + '15' }}>
                                                    <ThemedText type="extraExtraSmall" style={{ width: 120, color: theme.theme.text, paddingLeft: 10 }}>{w.wfName}</ThemedText>
                                                    <ThemedText type="extraExtraSmall" style={{ width: 80, color: theme.theme.textSecondary, paddingLeft: 10 }}>{w.createdOn ? new Date(w.createdOn).toLocaleDateString() : '-'}</ThemedText>
                                                    <ThemedText type="extraExtraSmall" style={{ width: 120, color: theme.theme.text, paddingLeft: 10 }}>{w.wfLevel}</ThemedText>
                                                    <ThemedText type="extraExtraSmall" style={{ width: 100, color: theme.theme.textSecondary, paddingLeft: 10 }}>{w.createdByUsername || '-'}</ThemedText>
                                                    <View style={{ width: 60, alignItems: 'center', paddingLeft: 10 }}>
                                                        <TouchableOpacity onPress={() => setViewingWorkflow(w)}>
                                                            <Ionicons name="eye-outline" size={18} color={theme.theme.primary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            ))}
                                        </View>
                                    </ScrollView>
                                </ScrollView>
                                {tableScrollW > tableVisibleW + 5 && tableScrollX + tableVisibleW < tableScrollW - 5 && (
                                    <View pointerEvents="none" style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 32, justifyContent: 'center', alignItems: 'flex-end' }}>
                                        <Ionicons name="chevron-forward" size={18} color={theme.theme.textSecondary} />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
            <WorkflowViewModal
                workflow={viewingWorkflow}
                visible={!!viewingWorkflow}
                theme={theme}
                onClose={() => setViewingWorkflow(null)}
            />
        </>
    );
}
