import type { Asset } from '../types/topology';

// Asset categories for the palette
export const assetCategories = ['Network', 'Security', 'Servers', 'Storage', 'Cloud', 'Other'] as const;

// Device icons from devices folder
import ciscoSwitchIcon from './icons/devices/ciscoSwitch.png';
import ciscoRouterIcon from './icons/devices/ciscoRouter.png';
import ciscoFtdFirewallIcon from './icons/devices/cisco_ftd_firewall.png';
import networkSwitchIcon from './icons/devices/network_switch-C8bXqsBJ.png';
import managedSwitchIcon from './icons/devices/managed_switch-CM6t_Nsc.png';
import f5WafIcon from './icons/devices/f5_waf-SPAkqmYD.png';
import fortigateFirewallIcon from './icons/devices/fortigate_firewall-BHOr4P-U@3x.png';
import esxiServerIcon from './icons/devices/esxi_server-0vDLaiJD.png';
import serverBladeIcon from './icons/devices/server_blade-So6LCGC8.png';
import serverRackIcon from './icons/devices/server_rack-CtkQ6ao6.png';
import fujitsuSanSwitchIcon from './icons/devices/fujitsu_san_switch-CnZLxWsh.png';
import fujitsuBackupServerIcon from './icons/devices/fujitsu_backup_server-C_KZZLhv.png';
import fujitsuStorageSystemIcon from './icons/devices/fujitsu_storage_system-BlN8IipV.png';
import secureEnclosureIcon from './icons/devices/secure_enclosure-Dtjd50qL.png';
import dvrIcon from './icons/devices/DVR.png';
import internetIcon from './icons/devices/Internet.png';
import wifiIcon from './icons/devices/wifi.png';
import fujitsuCoreSwitchIcon from './icons/devices/fujitsu_core_switch.png';

// Alternative device icons from extracted_devices
import cisco_switch_alt from './icons/devices/cisco_switch_alt.png';
import f5_big_ip_alt from './icons/devices/f5_big_ip_alt.png';
import fortigate_601e_left_alt from './icons/devices/fortigate_601e_left_alt.png';
import cucm_server_alt from './icons/devices/cucm_server_alt.png';
import voip_router_alt from './icons/devices/voip_router_alt.png';
import legacy_dmz_alt from './icons/devices/legacy_dmz_alt.png';
import fujitsu_core_switch_alt from './icons/devices/fujitsu_core_switch_alt.png';
import cisco_ftd_3105_alt from './icons/devices/cisco_ftd_3105_alt.png';
import backup_server_alt from './icons/devices/backup_server_alt.png';
import esxi_blade_alt from './icons/devices/esxi_blade_alt.png';
import tape_library_alt from './icons/devices/tape_library_alt.png';
import brocade_san_switch_alt from './icons/devices/brocade_san_switch_alt.png';
import fujitsu_af250_storage_alt from './icons/devices/fujitsu_af250_storage_alt.png';
import personal_computer_alt from './icons/devices/personal_computer_alt.png';
import voip_phone_alt from './icons/devices/voip_phone_alt.png';

export const builtInAssets: Asset[] = [
  // ========== NETWORK DEVICES ==========
  {
    id: 'cisco-switch',
    name: 'Cisco Switch',
    type: 'builtin',
    src: ciscoSwitchIcon,
    category: 'Network',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'cisco-router',
    name: 'Cisco Router',
    type: 'builtin',
    src: ciscoRouterIcon,
    category: 'Network',
    defaultWidth: 150,
    defaultHeight: 110,
  },
  {
    id: 'network-switch',
    name: 'Network Switch',
    type: 'builtin',
    src: networkSwitchIcon,
    category: 'Network',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'managed-switch',
    name: 'Managed Switch',
    type: 'builtin',
    src: managedSwitchIcon,
    category: 'Network',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'fujitsu-san-switch',
    name: 'Fujitsu SAN Switch',
    type: 'builtin',
    src: fujitsuSanSwitchIcon,
    category: 'Network',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'wifi-router',
    name: 'WiFi Router',
    type: 'builtin',
    src: wifiIcon,
    category: 'Network',
    defaultWidth: 140,
    defaultHeight: 110,
  },
  {
    id: 'fujitsu-core-switch',
    name: 'Fujitsu Core Switch',
    type: 'builtin',
    src: fujitsuCoreSwitchIcon,
    category: 'Network',
    defaultWidth: 160,
    defaultHeight: 165,
  },

  // ========== SECURITY DEVICES ==========
  {
    id: 'cisco-ftd-firewall',
    name: 'Cisco FTD Firewall',
    type: 'builtin',
    src: ciscoFtdFirewallIcon,
    category: 'Security',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'f5-waf',
    name: 'F5 WAF (BIG-IP)',
    type: 'builtin',
    src: f5WafIcon,
    category: 'Security',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'fortigate-firewall',
    name: 'FortiGate Firewall',
    type: 'builtin',
    src: fortigateFirewallIcon,
    category: 'Security',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'secure-enclosure',
    name: 'Secure Enclosure',
    type: 'builtin',
    src: secureEnclosureIcon,
    category: 'Security',
    defaultWidth: 140,
    defaultHeight: 110,
  },
  {
    id: 'dvr-system',
    name: 'DVR System',
    type: 'builtin',
    src: dvrIcon,
    category: 'Security',
    defaultWidth: 140,
    defaultHeight: 100,
  },

  // ========== SERVERS ==========
  {
    id: 'esxi-server',
    name: 'ESXi Server',
    type: 'builtin',
    src: esxiServerIcon,
    category: 'Servers',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'server-blade',
    name: 'Server Blade',
    type: 'builtin',
    src: serverBladeIcon,
    category: 'Servers',
    defaultWidth: 150,
    defaultHeight: 110,
  },
  {
    id: 'server-rack',
    name: 'Server Rack',
    type: 'builtin',
    src: serverRackIcon,
    category: 'Servers',
    defaultWidth: 130,
    defaultHeight: 120,
  },

  // ========== STORAGE ==========
  {
    id: 'fujitsu-backup-server',
    name: 'Fujitsu Backup Server',
    type: 'builtin',
    src: fujitsuBackupServerIcon,
    category: 'Storage',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'fujitsu-storage-system',
    name: 'Fujitsu Storage System',
    type: 'builtin',
    src: fujitsuStorageSystemIcon,
    category: 'Storage',
    defaultWidth: 150,
    defaultHeight: 100,
  },

  // ========== CLOUD ==========
  {
    id: 'internet',
    name: 'Internet',
    type: 'builtin',
    src: internetIcon,
    category: 'Cloud',
    defaultWidth: 140,
    defaultHeight: 110,
  },

  // ========== ALTERNATIVE DEVICE STYLES ==========
  {
    id: 'cisco_switch_alt',
    name: 'Cisco Switch (3D)',
    type: 'builtin',
    src: cisco_switch_alt,
    category: 'Network',
    defaultWidth: 150,
    defaultHeight: 96,
  },
  {
    id: 'f5_big_ip_alt',
    name: 'F5 BIG-IP (3D)',
    type: 'builtin',
    src: f5_big_ip_alt,
    category: 'Security',
    defaultWidth: 150,
    defaultHeight: 100,
  },
  {
    id: 'fortigate_601e_alt',
    name: 'FortiGate 601E (3D)',
    type: 'builtin',
    src: fortigate_601e_left_alt,
    category: 'Security',
    defaultWidth: 150,
    defaultHeight: 72,
  },
  {
    id: 'cucm_server_alt',
    name: 'CUCM Server (3D)',
    type: 'builtin',
    src: cucm_server_alt,
    category: 'Servers',
    defaultWidth: 100,
    defaultHeight: 105,
  },
  {
    id: 'voip_router_alt',
    name: 'VoIP Router (3D)',
    type: 'builtin',
    src: voip_router_alt,
    category: 'Network',
    defaultWidth: 72,
    defaultHeight: 100,
  },
  {
    id: 'legacy_dmz_alt',
    name: 'Legacy DMZ (3D)',
    type: 'builtin',
    src: legacy_dmz_alt,
    category: 'Security',
    defaultWidth: 80,
    defaultHeight: 100,
  },
  {
    id: 'fujitsu_core_switch_alt',
    name: 'Fujitsu Core Switch (3D)',
    type: 'builtin',
    src: fujitsu_core_switch_alt,
    category: 'Network',
    defaultWidth: 100,
    defaultHeight: 103,
  },
  {
    id: 'cisco_ftd_3105_alt',
    name: 'Cisco FTD 3105 (3D)',
    type: 'builtin',
    src: cisco_ftd_3105_alt,
    category: 'Security',
    defaultWidth: 150,
    defaultHeight: 95,
  },
  {
    id: 'backup_server_alt',
    name: 'Backup Server (3D)',
    type: 'builtin',
    src: backup_server_alt,
    category: 'Servers',
    defaultWidth: 120,
    defaultHeight: 100,
  },
  {
    id: 'esxi_blade_alt',
    name: 'ESXi Blade (3D)',
    type: 'builtin',
    src: esxi_blade_alt,
    category: 'Servers',
    defaultWidth: 150,
    defaultHeight: 61,
  },
  {
    id: 'tape_library_alt',
    name: 'Tape Library (3D)',
    type: 'builtin',
    src: tape_library_alt,
    category: 'Storage',
    defaultWidth: 137,
    defaultHeight: 100,
  },
  {
    id: 'brocade_san_switch_alt',
    name: 'Brocade SAN Switch (3D)',
    type: 'builtin',
    src: brocade_san_switch_alt,
    category: 'Storage',
    defaultWidth: 150,
    defaultHeight: 84,
  },
  {
    id: 'fujitsu_af250_storage_alt',
    name: 'Fujitsu AF250 Storage (3D)',
    type: 'builtin',
    src: fujitsu_af250_storage_alt,
    category: 'Storage',
    defaultWidth: 150,
    defaultHeight: 62,
  },
  {
    id: 'personal_computer_alt',
    name: 'Personal Computer (3D)',
    type: 'builtin',
    src: personal_computer_alt,
    category: 'Other',
    defaultWidth: 86,
    defaultHeight: 100,
  },
  {
    id: 'voip_phone_alt',
    name: 'VoIP Phone (3D)',
    type: 'builtin',
    src: voip_phone_alt,
    category: 'Other',
    defaultWidth: 130,
    defaultHeight: 100,
  },
];
