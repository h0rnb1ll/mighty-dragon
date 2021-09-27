var labels = {zh_Hans: {
    pmfd_home: 'PMFD主页',
    obs: 'OBS',
    brg1: '方位1',
    brg2: '方位2',
    off: '关闭',
    cas_up: 'CAS UP',
    cas_down: 'CAS DOWN',
    spd_bugs: 'Speed Bugs',
    timers: '计时器',
    minimums: 'Minimums',
    tfc_map: '交通地图',
    pfd_map_settings: 'PFD地图设置',
    sensors: '传感器',

}
}

export function initLabels(locale) {
    //document.getElementById('').innerHTML(labels[locale]);
    document.getElementById('PageTitle').innerHTML(labels[locale].pmfd_home);
    document.getElementById('label_obs').innerHTML(labels[locale].obs);
    document.getElementById('label_cas_up').innerHTML(labels[locale].cas_up);
    document.getElementById('label_brg_1').innerHTML(labels[locale].brg1);
    document.getElementById('label_brg_1_off').innerHTML(labels[locale].off);
    document.getElementById('label_brg_2').innerHTML(labels[locale].brg2);
    document.getElementById('label_brg_2_off').innerHTML(labels[locale].off);
    document.getElementById('label_cas_down').innerHTML(labels[locale].cas_down);
}