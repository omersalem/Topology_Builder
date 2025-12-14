import type { Asset } from '../types/topology';

// High-quality premium icons (original with matching background)
import networkSwitchIcon from './icons/premium/network_switch.png';
import routerIcon from './icons/premium/router.png';
import f5WafIcon from './icons/premium/f5_waf.png';
import fortigateFirewallIcon from './icons/premium/fortigate_firewall.png';
import ciscoFtdFirewallIcon from './icons/premium/cisco_ftd_firewall.png';
import internetCloudIcon from './icons/premium/internet_cloud.png';
import cloudSmallIcon from './icons/premium/cloud_small.png';
import esxiServerIcon from './icons/premium/esxi_server.png';
import fujitsuSanSwitchIcon from './icons/premium/fujitsu_san_switch.png';
import fujitsuBackupServerIcon from './icons/premium/fujitsu_backup_server.png';
import fujitsuStorageSystemIcon from './icons/premium/fujitsu_storage_system.png';
// Extra Icons - Network / Infrastructure
import sfpModuleIcon from './icons/extra/sfp_module.png';
import mediaConverterIcon from './icons/extra/media_converter.png';
import pduStripIcon from './icons/extra/pdu_strip.png';
import serialDeviceIcon from './icons/extra/serial_device.png';
import wifiRouterIcon from './icons/extra/wifi_router.png';
import wifiApIcon from './icons/extra/wifi_ap.png';
import managedSwitchIcon from './icons/extra/managed_switch.png';

// Extra Icons - Security
import vpnGatewayIcon from './icons/extra/vpn_gateway.png';
import securityBoxIcon from './icons/extra/security_box.png';
import secureEnclosureIcon from './icons/extra/secure_enclosure.png';
import securityCameraIcon from './icons/extra/security_camera.png';
import dvrSystemIcon from './icons/extra/dvr_system.png';

// Extra Icons - Compute / Storage
import serverBladeIcon from './icons/extra/server_blade.png';
import pcTowerIcon from './icons/extra/pc_tower.png';
import towerServer2Icon from './icons/extra/tower_server_2.png';
import nasDriveIcon from './icons/extra/nas_drive.png';
import serverRackIcon from './icons/server_rack.png';

// Extra Icons - IoT / Office / Misc
import dockingStationIcon from './icons/extra/docking_station.png';
import biometricReaderIcon from './icons/extra/biometric_reader.png';
import smartSpeakerIcon from './icons/extra/smart_speaker.png';
import wirelessChargerIcon from './icons/extra/wireless_charger.png';
import automationPlcIcon from './icons/extra/automation_plc.png';
import voipPhoneIcon from './icons/extra/voip_phone.png';

export const builtInAssets: Asset[] = [
  // ========== PREMIUM ICONS (Original) ==========
  // Network Devices
  {
    id: 'premium-network-switch',
    name: 'Network Switch',
    type: 'builtin',
    src: networkSwitchIcon,
    category: 'Network',
    defaultWidth: 170,
    defaultHeight: 130,
  },
  {
    id: 'premium-router',
    name: 'Router',
    type: 'builtin',
    src: routerIcon,
    category: 'Network',
    defaultWidth: 170,
    defaultHeight: 130,
  },

  // Security Devices
  {
    id: 'premium-f5-waf',
    name: 'F5 WAF (BIG-IP)',
    type: 'builtin',
    src: f5WafIcon,
    category: 'Security',
    defaultWidth: 170,
    defaultHeight: 130,
  },
  {
    id: 'premium-fortigate',
    name: 'FortiGate Firewall',
    type: 'builtin',
    src: fortigateFirewallIcon,
    category: 'Security',
    defaultWidth: 170,
    defaultHeight: 130,
  },
  {
    id: 'premium-cisco-ftd',
    name: 'Cisco FTD Firewall',
    type: 'builtin',
    src: ciscoFtdFirewallIcon,
    category: 'Security',
    defaultWidth: 170,
    defaultHeight: 130,
  },

  // Cloud & External
  {
    id: 'premium-cloud',
    name: 'Internet Cloud',
    type: 'builtin',
    src: internetCloudIcon,
    category: 'External',
    defaultWidth: 170,
    defaultHeight: 130,
  },
  {
    id: 'premium-cloud-small',
    name: 'Cloud (Small)',
    type: 'builtin',
    src: cloudSmallIcon,
    category: 'External',
    defaultWidth: 130,
    defaultHeight: 150,
  },

  // Compute
  {
    id: 'premium-esxi',
    name: 'ESXi Server',
    type: 'builtin',
    src: esxiServerIcon,
    category: 'Compute',
    defaultWidth: 140,
    defaultHeight: 120,
  },

  // Storage Devices
  {
    id: 'premium-fujitsu-san',
    name: 'Fujitsu SAN Switch',
    type: 'builtin',
    src: fujitsuSanSwitchIcon,
    category: 'Storage',
    defaultWidth: 140,
    defaultHeight: 120,
  },
  {
    id: 'premium-fujitsu-backup',
    name: 'Fujitsu Backup',
    type: 'builtin',
    src: fujitsuBackupServerIcon,
    category: 'Storage',
    defaultWidth: 140,
    defaultHeight: 120,
  },
  {
    id: 'premium-fujitsu-storage',
    name: 'Fujitsu Storage Tower',
    type: 'builtin',
    src: fujitsuStorageSystemIcon,
    category: 'Storage',
    defaultWidth: 110,
    defaultHeight: 140,
  },

  // ========== NEW EXTRACTED ICONS ==========

  // Network Infrastructure
  { id: 'extra-wifi-router', name: 'WiFi Router', type: 'builtin', src: wifiRouterIcon, category: 'Network', defaultWidth: 120, defaultHeight: 100 },
  { id: 'extra-wifi-ap', name: 'WiFi Access Point', type: 'builtin', src: wifiApIcon, category: 'Network', defaultWidth: 120, defaultHeight: 100 },
  { id: 'extra-managed-switch', name: 'Managed Switch', type: 'builtin', src: managedSwitchIcon, category: 'Network', defaultWidth: 120, defaultHeight: 100 },
  { id: 'extra-media-converter', name: 'Media Converter', type: 'builtin', src: mediaConverterIcon, category: 'Network', defaultWidth: 120, defaultHeight: 100 },
  { id: 'extra-sfp-module', name: 'SFP Module', type: 'builtin', src: sfpModuleIcon, category: 'Network', defaultWidth: 100, defaultHeight: 80 },
  { id: 'extra-pdu-strip', name: 'PDU Strip', type: 'builtin', src: pduStripIcon, category: 'Network', defaultWidth: 140, defaultHeight: 60 },
  { id: 'extra-serial-device', name: 'Serial Device', type: 'builtin', src: serialDeviceIcon, category: 'Network', defaultWidth: 120, defaultHeight: 100 },

  // Security
  { id: 'extra-vpn-gateway', name: 'VPN Gateway', type: 'builtin', src: vpnGatewayIcon, category: 'Security', defaultWidth: 120, defaultHeight: 100 },
  { id: 'extra-security-camera', name: 'Security Camera', type: 'builtin', src: securityCameraIcon, category: 'Security', defaultWidth: 100, defaultHeight: 100 },
  { id: 'extra-dvr-system', name: 'DVR System', type: 'builtin', src: dvrSystemIcon, category: 'Security', defaultWidth: 120, defaultHeight: 100 },
  { id: 'extra-security-box', name: 'Security Box', type: 'builtin', src: securityBoxIcon, category: 'Security', defaultWidth: 120, defaultHeight: 120 },
  { id: 'extra-secure-enclosure', name: 'Secure Enclosure', type: 'builtin', src: secureEnclosureIcon, category: 'Security', defaultWidth: 100, defaultHeight: 130 },

  // Compute
  { id: 'extra-server-blade', name: 'Server Blade', type: 'builtin', src: serverBladeIcon, category: 'Compute', defaultWidth: 130, defaultHeight: 80 },
  { id: 'extra-pc-tower', name: 'PC Tower', type: 'builtin', src: pcTowerIcon, category: 'Compute', defaultWidth: 100, defaultHeight: 130 },
  { id: 'extra-tower-server-2', name: 'Server Tower', type: 'builtin', src: towerServer2Icon, category: 'Compute', defaultWidth: 100, defaultHeight: 140 },
  { id: 'extra-server-rack', name: 'Server Rack', type: 'builtin', src: serverRackIcon, category: 'Compute', defaultWidth: 100, defaultHeight: 140 },

  // Storage
  { id: 'extra-nas-drive', name: 'NAS Drive', type: 'builtin', src: nasDriveIcon, category: 'Storage', defaultWidth: 110, defaultHeight: 130 },

  // IoT / Office
  { id: 'extra-voip-phone', name: 'VoIP Phone', type: 'builtin', src: voipPhoneIcon, category: 'IoT', defaultWidth: 110, defaultHeight: 100 },
  { id: 'extra-smart-speaker', name: 'Smart Speaker', type: 'builtin', src: smartSpeakerIcon, category: 'IoT', defaultWidth: 90, defaultHeight: 120 },
  { id: 'extra-wireless-charger', name: 'Wireless Charger', type: 'builtin', src: wirelessChargerIcon, category: 'IoT', defaultWidth: 100, defaultHeight: 80 },
  { id: 'extra-docking-station', name: 'Docking Station', type: 'builtin', src: dockingStationIcon, category: 'IoT', defaultWidth: 120, defaultHeight: 100 },
  { id: 'extra-biometric-reader', name: 'Biometric Reader', type: 'builtin', src: biometricReaderIcon, category: 'IoT', defaultWidth: 90, defaultHeight: 120 },
  { id: 'extra-automation-plc', name: 'Automation PLC', type: 'builtin', src: automationPlcIcon, category: 'IoT', defaultWidth: 110, defaultHeight: 130 },
];

export const assetCategories = ['Network', 'Security', 'Compute', 'Storage', 'IoT', 'External', 'Custom'];
