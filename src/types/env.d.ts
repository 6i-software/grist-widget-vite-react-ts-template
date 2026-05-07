declare module '*/tools/vite-plugins/grist-manifest.js' {
    import { PluginOption } from 'vite';

    const generateGristManifestPlugin: (pkg: unknown) => PluginOption;
    const updateGristManifestDistPlugin: (pkg: unknown) => PluginOption;

    export { generateGristManifestPlugin, updateGristManifestDistPlugin };
}