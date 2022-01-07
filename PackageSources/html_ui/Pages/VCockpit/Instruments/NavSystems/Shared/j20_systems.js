const okElements = [
    'stat_ok_aileron_l',
    'stat_ok_aileron_r',
    'stat_ok_canard_l',
    'stat_ok_canard_r',
    'stat_ok_eng_l',
    'stat_ok_eng_r',
    'stat_ok_flaps_l',
    'stat_ok_flaps_r',
    'stat_ok_fuse_aft_b',
    'stat_ok_fuse_aft',
    'stat_ok_fuse_mid',
    'stat_ok_fuse_mid_b',
    'stat_ok_gear_fwd',
    'stat_ok_gear_l',
    'stat_ok_gear_r',
    'stat_ok_nose',
    'stat_ok_nose_b',
    'stat_ok_slat_l',
    'stat_ok_slat_r',
    'stat_ok_stab_l',
    'stat_ok_stab_r',
    'stat_ok_wing_l',
    'stat_ok_wing_r',
    'stat_ok_wpn_door_m',
    'stat_ok_wpn_door_l',
    'stat_ok_wpn_door_r'
];

const errorElements = [
    'stat_err_aileron_l',
    'stat_err_aileron_r',
    'stat_err_canard_l',
    'stat_err_canard_r',
    'stat_err_eng_l',
    'stat_err_eng_r',
    'stat_err_flaps_l',
    'stat_err_flaps_r',
    'stat_err_fuse_aft_b',
    'stat_err_fuse_aft',
    'stat_err_fuse_mid',
    'stat_err_fuse_mid_b',
    'stat_err_gear_fwd',
    'stat_err_gear_l',
    'stat_err_gear_r',
    'stat_err_nose',
    'stat_err_nose_b',
    'stat_err_slat_l',
    'stat_err_slat_r',
    'stat_err_stab_l',
    'stat_err_stab_r',
    'stat_err_wing_l',
    'stat_err_wing_r',
    'stat_err_wpn_door_m',
    'stat_err_wpn_door_l',
    'stat_err_wpn_door_r'
];

const simvar_messages = "L:J20_MESSAGES";

class J20_Systems {
    constructor() {
        this.isCheckingSystems = false;
    }
    
    checkAllSystems() {
        if(!this.isCheckingSystems) {
            this.isCheckingSystems = true;
            errorElements.forEach((key,i,arr)=>{
                var errElement = document.getElementById(key);
                var okElement = document.getElementById(key.replace('_err_','_ok_'));
                okElement.style.display = "none";
                errElement.style.display = "block";
            });
            this.showMessage({text:'系统检测中...'},true);
            var delayed = this.delay(()=>{},0);
            okElements.forEach((key,i,arr)=>{
                var errKey = key.replace('_ok_','_err_');
                var element = document.getElementById(key);
                var errElement = document.getElementById(errKey);
                delayed = delayed.delay(()=>{
                    errElement.style.display = "none";
                    element.style.display = "block";
                },500);
            });
            delayed.delay(()=>{
                okElements.forEach((key,i,arr)=>{
                    document.getElementById(key).style.display="none";
                });
                this.showMessage({text:'系统检测完毕 无异常',color:'lawngreen'});
                this.isCheckingSystems = false;
            },500);
        }
    }

    showMessage(message, clearPrevious) {
        var messages = document.getElementById("Messages").innerHTML;
        if(clearPrevious) messages = ``;
        if(!message.color) message.color = '#ffffff';
        messages += `<span style="color:${message.color}">${message.text}</span><br/>`;
        document.getElementById("Messages").innerHTML = messages;
    }

    clearMessages() {
        document.getElementById("Messages").innerHTML = '';
    }

    delay(fn, t) {
        // private instance variables
        var queue = [], self, timer;
        
        function schedule(fn, t) {
            timer = setTimeout(function() {
                timer = null;
                fn();
                if (queue.length) {
                    var item = queue.shift();
                    schedule(item.fn, item.t);
                }
            }, t);            
        }
        self = {
            delay: function(fn, t) {
                // if already queuing things or running a timer, 
                //   then just add to the queue
                  if (queue.length || timer) {
                    queue.push({fn: fn, t: t});
                } else {
                    // no queue or timer yet, so schedule the timer
                    schedule(fn, t);
                }
                return self;
            },
            cancel: function() {
                clearTimeout(timer);
                queue = [];
                return self;
            }
        };
        return self.delay(fn, t);
    }
}