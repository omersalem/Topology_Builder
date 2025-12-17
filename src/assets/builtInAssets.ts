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
];
