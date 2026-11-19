/* JellyTCM · v2.8 推拿模块
 * 两部分：成人推拿手法（按揉推拿滚擦捏抖…）与小儿推拿（清天河水、退六腑、捏脊…）。
 * 小儿推拿的流派差异很大，尤其是「天河水」的方向与寒温，这里把主流说法并列写出来，
 * 并明确标注「各家表述不一，以师承与教材为准」，避免把一说当定论。
 * 本站只作学习与家庭保健参考，不替代诊疗；发热、外伤、急腹症等须就医。
 */
(function(){
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  /* ---------------- 成人手法（g: 基础按摩 / 强刺激 / 关节） ---------------- */
  const HAND = [
    {n:'按法', g:'基础按摩', d:'指按或掌按，垂直向下用力，由轻到重，稳而持续。', use:'放松肌肉、缓解疼痛、点穴', key:'着力点固定不移动；按到酸胀后保持 5~10 秒，再缓缓起手，不要突然撤力。'},
    {n:'揉法', g:'基础按摩', d:'指腹或掌根吸定于一点，做轻柔缓和的环形转动，带动皮下组织。', use:'放松、消胀、化瘀', key:'「吸定」是关键——手不离开皮肤、不与皮肤摩擦；频率约 120~160 次/分。'},
    {n:'推法', g:'基础按摩', d:'指、掌或肘部着力，沿直线单向推动。', use:'通络、行气、放松条索', key:'单向、缓慢、着实；常配介质（油、粉）以免擦伤；成人多用掌推，小儿多用指推。'},
    {n:'拿法', g:'基础按摩', d:'拇指与其余四指相对用力，提捏肌肉再放松，一紧一松。', use:'颈肩、四肢的酸胀紧硬', key:'拿住肌腹而非皮肤；腕部放松，动作连贯；拿肩井、拿风池最常用。'},
    {n:'摩法', g:'基础按摩', d:'掌面或指面轻贴体表，做环形抚摩，不带动深层。', use:'腹部、胸胁的调理', key:'轻而不浮、缓而不滞；摩腹一般顺时针（促排便）或逆时针（止泻）各有讲究。'},
    {n:'擦法', g:'基础按摩', d:'掌根、大鱼际或小鱼际紧贴皮肤，做快速往返摩擦，以透热为度。', use:'温经散寒、活血', key:'必须用介质；速度均匀，擦至温热即止，别擦到皮肤发红疼痛。'},
    {n:'滚法', g:'基础按摩', d:'以手背近小指侧部分附着，通过腕关节屈伸与前臂旋转，连续滚动。', use:'肩背腰臀等大块肌肉', key:'压力、频率、摆幅三者要匀；这是放松腰背的主力手法，需练过才有力透感。'},
    {n:'捏法', g:'基础按摩', d:'拇指与食、中指相对，捏起皮肤与浅层肌肉，交替捻动前移。', use:'捏脊、四肢', key:'捏起而非掐起；小儿捏脊自下而上，成人可用于肩背。'},
    {n:'抹法', g:'基础按摩', d:'拇指罗纹面轻贴皮肤，做上下左右或弧形的往返抹动，力度比推法更轻。', use:'头面、前额、颈项', key:'轻贴而不压；前额与眉弓从中间向两侧抹，助放松；头面手法宜闭目静躺时做。'},
    {n:'扫散法', g:'基础按摩', d:'拇指桡侧面贴额角（太阳一带），四指微屈置于枕部，自前向耳后快速扫动。', use:'头痛、头晕、偏头痛', key:'一手扶住对侧头固定，扫散沿胆经走行，自太阳扫至耳后高骨，每侧 20~30 次；速度宜快、力度宜轻。'},
    {n:'点法', g:'强刺激', d:'以指端或屈指骨突点压穴位，着力面小、刺激强。', use:'穴位强刺激、止痛', key:'时间短、力度可控；年老体弱、心脏病患者慎用强点。'},
    {n:'拍法', g:'强刺激', d:'五指并拢或空掌，有节律地拍打体表。', use:'放松、振奋', key:'空掌、腕部放松；脊柱正中、肾区、头部不拍。'},
    {n:'抖法', g:'强刺激', d:'握持肢体远端，做小幅度高频抖动。', use:'上肢、下肢的放松收尾', key:'抖动幅度小、频率快，牵拉力不要过大。'},
    {n:'拨法', g:'强刺激', d:'拇指深按至肌腹或肌腱旁，做与纤维垂直方向的往返拨动。', use:'条索、粘连、痛点', key:'「按到深处再拨」，拨 3~5 次即可；神经走行处（如肘内、腘窝）禁拨。'},
    {n:'搓法', g:'强刺激', d:'两手掌面相对夹住肢体或胁肋，做方向相反的快速搓揉，同时缓慢上下移动。', use:'四肢酸胀、胁肋胀闷', key:'夹持力适中，搓至发热即止；上肢搓后配抖法收尾更好；胁肋自上而下搓，可疏肝理气。'},
    {n:'捻法', g:'强刺激', d:'拇指与食指罗纹面捏住指（趾）小关节，做灵活快速的交替捻动。', use:'手指足趾麻木、小关节僵痛', key:'捻动幅度小、频率快，宜在关节两侧施力；用于久坐打字后的手指放松很合适。'},
    {n:'摇法', g:'关节手法', d:'一手扶住关节近端固定，一手握远端做被动的环转摇动。', use:'颈、肩、腕、踝的僵硬活动不利', key:'幅度由小到大、在生理活动范围内；骨质疏松与外伤后禁摇颈；摇颈属专业手法，不建议自学。'},
    {n:'拔伸法', g:'关节手法', d:'沿肢体纵轴方向持续牵拉，使关节间隙增宽。', use:'落枕、腰部酸胀的牵引放松', key:'力宜稳、缓，勿用爆发力；颈椎拔伸须由受过训练者操作；牵引后稍作揉按放松再结束。'},
    {n:'扳法', g:'关节手法', d:'在关节生理活动范围内，做快速、有控制的扳动，常伴「咔」声。', use:'颈椎、胸椎、腰椎的调整', key:'属高风险手法：必须排除骨折、骨质疏松、椎动脉问题，由受过训练者操作；本站不建议自学扳颈。'}
  ];

  /* ---------------- 小儿推拿 · 天河水专题 ---------------- */
  /* ---------------- 小儿推拿 · 天河水专题 ----------------
   * 同一条前臂正中线，方向、介质、次数不同就有五六个名字。
   * 各流派表述不一，这里把常见说法并列，寒温从「微凉」到「大凉」排成梯度，方便对照。 */
  const TIANHE = [
    {n:'清天河水', mode:'up', xing:'性微凉，平和', rank:1,
     dir:'从腕横纹（总筋）推向肘横纹（洪池）',
     zhu:'清热解表、泻心火、除烦躁',
     use:'外感发热（低到中度）、烦躁不安、口渴、口舌生疮、夜啼。是小儿发热最常用的基础操作。',
     num:'300~500 次（约 3~5 分钟）',
     note:'向心直推，手法轻快均匀；配合开天门、推坎宫、揉太阳，就是最常用的「外感四大手法 + 清天河水」组合。'},
    {n:'引水上天河', mode:'up', xing:'性凉（较清天河水更凉）', rank:2,
     dir:'先蘸少量凉水滴在总筋（一说滴在内劳宫），再由此蘸水直推上至洪池，边推边蘸水，推完用手指轻弹其上',
     zhu:'清热除烦、引水以济',
     use:'发热不退、午后潮热、烦躁口渴。',
     num:'蘸水推 100~200 次',
     note:'出自《小儿按摩经》一路的老操作，「滴水位置」诸书说法不一（总筋 / 内劳宫 / 掌心），本页把主流两说并列；蘸水不宜多，推后擦干保暖。'},
    {n:'取天河水', mode:'down', xing:'性大凉', rank:3,
     dir:'从肘横纹（洪池）推向腕横纹（总筋），或先沾凉水自总筋弹打至洪池',
     zhu:'清热泻火、凉血',
     use:'高热、实热证、烦躁口渴明显、大便干、舌红苔黄。',
     num:'200~300 次',
     note:'比清天河水寒凉更甚，热退即止，不宜久用；脾虚、易腹泻的孩子慎用。'},
    {n:'大推天河水', mode:'combo', xing:'性大凉', rank:4,
     dir:'常见两说：①「清天河水 + 退六腑」交替连用（先清天河水 100 次，再退六腑 100 次，循环）；②用力大幅推天河水',
     zhu:'清热凉血、泻火之力更著',
     use:'高热实证、热势较盛。',
     num:'各 200~300 次，交替进行',
     note:'此名多见于民间流派与部分地区教材，操作定义并不统一——遇到这个名字先问清具体怎么做。寒凉峻猛，热退即停，脾虚易泻者不用。'},
    {n:'打马过天河', mode:'tap', xing:'性大凉', rank:5,
     dir:'食、中指沾凉水，自总筋交替弹打至洪池，边弹边向其上吹气',
     zhu:'清热、通经、行气',
     use:'高热不退、神昏烦躁。',
     num:'弹打 3~5 遍',
     note:'属复式操作，刺激较强，多用于急症辅助；操作后注意保暖、补充水分。'}
  ];

  /* 天河水以外的清热「线」与温法，便于横向对照 */
  const KIDHEAT = [
    {n:'退六腑', pos:'前臂尺侧（小指侧），肘→腕直推', xing:'大凉', use:'高热、咽痛、便秘、斑疹'},
    {n:'推脊', pos:'大椎至龟尾，沿脊柱自上而下直推', xing:'凉', use:'发热（此向为清）'},
    {n:'水底捞月', pos:'复式：先清天河水，再自小指根经掌根推至内劳宫，边推边吹气', xing:'大凉', use:'高热烦躁'},
    {n:'推三关', pos:'前臂桡侧（拇指侧），腕→肘直推', xing:'温', use:'虚寒畏寒——与清热诸法方向相反，别混用'}
  ];

  /* ---------------- 小儿常用穴与操作 ---------------- */
  const KID = [
    {n:'脾经', loc:'拇指桡侧缘，指尖至指根成一直线', op:'补脾：从指尖推向指根；清脾：从指根推向指尖', zhu:'补脾健运、清脾化湿热', use:'厌食、腹泻、积食（多用补法）'},
    {n:'肝经', loc:'食指掌面，指尖至指根', op:'清肝：从指根推向指尖（离心）', zhu:'平肝息风、清热', use:'烦躁、惊惕、目赤、夜啼'},
    {n:'心经', loc:'中指掌面，指尖至指根', op:'清心：从指根推向指尖', zhu:'清心泻火', use:'口舌生疮、夜啼、烦躁'},
    {n:'肺经', loc:'无名指掌面，指尖至指根', op:'补肺：向心推；清肺：离心推', zhu:'宣肺止咳、补肺固表', use:'咳嗽、反复感冒'},
    {n:'肾经', loc:'小指掌面，指尖至指根', op:'补肾：向心推', zhu:'补肾益精、强腰', use:'发育迟缓、遗尿、久病体虚'},
    {n:'大肠', loc:'食指桡侧缘，指尖至虎口', op:'清大肠：从虎口推向指尖；补大肠：反向', zhu:'清肠通便 / 涩肠止泻', use:'便秘（清）、腹泻（补）'},
    {n:'小肠', loc:'小指尺侧缘，指尖至指根', op:'清小肠：从指根推向指尖', zhu:'清利下焦湿热', use:'小便短赤、口舌生疮'},
    {n:'板门', loc:'手掌大鱼际平面', op:'揉板门 100~300 次', zhu:'健脾和胃、消食化滞', use:'积食、腹胀、食欲不振'},
    {n:'内八卦', loc:'掌心内劳宫四周，以掌心为圆心、掌心至中指根 2/3 为半径画圆', op:'运八卦 100~300 次（顺时针）', zhu:'宽胸理气、消食化痰', use:'胸闷、咳喘、呕吐、积食'},
    {n:'小天心', loc:'手掌大小鱼际交接处的凹陷中', op:'揉 100~300 次，或掐 3~5 次', zhu:'清心安神、镇惊', use:'夜啼、惊惕、烦躁'},
    {n:'外劳宫', loc:'手背正中央，与掌心内劳宫相对', op:'揉 100~300 次', zhu:'温阳散寒、升阳举陷', use:'风寒感冒、腹痛、脱肛（性温热，与内劳宫一温一清相对）'},
    {n:'膻中', loc:'两乳头连线中点，胸骨正中', op:'分推膻中：两拇指自中点向两侧分推 50~100 次；或揉 50 次', zhu:'宽胸理气、化痰止咳', use:'咳嗽、胸闷、呕吐'},
    {n:'迎香', loc:'鼻翼外缘中点旁开，鼻唇沟中', op:'揉 30~50 次（现代多以此代「黄蜂入洞」）', zhu:'宣通鼻窍', use:'鼻塞、流涕'},
    {n:'三关', loc:'前臂桡侧，腕横纹至肘横纹成一直线', op:'推三关：从腕推向肘（向心）300 次', zhu:'性温，温阳散寒、补气', use:'虚寒、畏寒、腹泻、病后体弱'},
    {n:'六腑', loc:'前臂尺侧，肘横纹至腕横纹成一直线', op:'退六腑：从肘推向腕（离心）300 次', zhu:'性凉，清热凉血解毒', use:'高热、咽痛、便秘、斑疹'},
    {n:'天河水', loc:'前臂正中，腕横纹至肘横纹成一直线', op:'清天河水 / 取天河水（见上）', zhu:'清热除烦', use:'发热、烦躁、口渴'},
    {n:'七节骨', loc:'第 4 腰椎棘突下至尾骨端成一直线', op:'推上七节骨（向上）温阳止泻；推下七节骨（向下）泻热通便', zhu:'调节肠道', use:'腹泻 / 便秘'},
    {n:'龟尾', loc:'尾骨端与肛门连线的中点', op:'揉 100~300 次', zhu:'调理大肠、止泻', use:'腹泻、脱肛'},
    {n:'开天门', loc:'两眉中间至前发际成一直线', op:'两拇指自下而上交替直推 50~100 次', zhu:'发汗解表、开窍醒神', use:'外感、头痛、惊惕'},
    {n:'推坎宫', loc:'自眉头沿眉向眉梢成一直线', op:'两拇指自眉心向眉梢分推 50~100 次', zhu:'疏风解表、明目', use:'外感头痛、目赤'},
    {n:'揉太阳', loc:'眉梢与目外眦之间向后约一横指凹陷处', op:'揉 50~100 次', zhu:'疏风清热、止痛', use:'头痛、目赤、发热'},
    {n:'揉耳后高骨', loc:'耳后入发际，乳突后缘下凹陷中', op:'揉 30~50 次', zhu:'疏风解表、镇惊', use:'外感、头痛、烦躁'},
    {n:'捏脊', loc:'脊柱两侧，自长强至大椎成一直线', op:'自下而上捏 3~6 遍，第 3 遍起「捏三提一」', zhu:'调阴阳、理气血、和脏腑、通经络', use:'厌食、积食、腹泻、体质虚弱、睡眠差'}
  ];

  const FUSHI = [
    {n:'黄蜂入洞', d:'食、中两指伸入孩子鼻孔，轻轻揉动 20~30 次。', use:'鼻塞、流涕。现代做法多改为揉迎香，更卫生也更易接受。'},
    {n:'运水入土 / 运土入水', d:'自小指根沿掌根运向拇指根（运水入土），或反向（运土入水）。', use:'运水入土偏治脾虚泄泻，运土入水偏治湿热、小便不利。'},
    {n:'水底捞月', d:'先清天河水，再以拇指自小指根经掌根、小天心推至内劳宫，边推边吹气。', use:'高热、烦躁，属大凉之法。'},
    {n:'二龙戏珠', d:'按捏孩子前臂，自总筋起交替揉捏至洪池，再点按曲池。', use:'惊惕、烦躁，偏镇惊。'},
    {n:'猿猴摘果', d:'以两手拇食指捏住孩子耳尖，交替上提下扯。', use:'惊惕、夜啼，偏安神。'},
    {n:'飞经走气', d:'拿住孩子四指，自曲池向下缓缓推按至总筋，再屈伸其手指。', use:'行气、通络，多用于痰鸣、气促。'}
  ];

  /* ---------------- 家庭保健套路 ---------------- */
  const ROUTINE = [
    {n:'小儿外感发热（初起）', for:'受凉后喷嚏、流清涕、低热、怕冷', steps:[
      '开天门 50~100 次 → 推坎宫 50~100 次 → 揉太阳 50 次 → 揉耳后高骨 30 次（四大手法）',
      '清天河水 300~500 次',
      '体温 38.5℃ 以上、口渴烦躁明显时，改「取天河水」或加「退六腑」200 次，热退即止',
      '多喝温水、避风保暖；<b>3 个月以下婴儿发热，或高热伴精神差、抽搐、皮疹，立即就医</b>'
    ]},
    {n:'小儿积食、食欲差', for:'口气重、腹胀、大便酸臭、舌苔厚腻、晚上睡不安', steps:[
      '补脾经 300 次 → 揉板门 200 次',
      '运八卦 200 次 → 摩腹（顺时针）3~5 分钟',
      '捏脊 3~6 遍（自下而上，第 3 遍起捏三提一）',
      '饮食减量、少油腻；积食反复或伴发热、呕吐，须就诊'
    ]},
    {n:'小儿夜啼、睡不安', for:'夜间哭闹、易惊、白天烦躁', steps:[
      '清心经 200 次 → 清肝经 200 次',
      '揉小天心 200 次 → 揉内劳宫 100 次',
      '摩腹 2~3 分钟，揉足三里各 1 分钟',
      '白天避免过度兴奋与惊吓；持续夜啼伴多汗、枕秃要查是否缺钙'
    ]},
    {n:'小儿便秘', for:'大便干硬、数日一行、排便费力', steps:[
      '清大肠 300 次 → 退六腑 200 次',
      '摩腹（顺时针）5 分钟 → 推下七节骨 100 次',
      '揉龟尾 100 次',
      '增加蔬菜水果与饮水，养成定时排便；顽固便秘或便中带血须就诊'
    ]},
    {n:'小儿腹泻', for:'大便稀溏、次数增多、食欲差', steps:[
      '补脾经 300 次 → 补大肠 200 次',
      '推三关 200 次 → 摩腹（逆时针）3 分钟 → 揉脐 100 次',
      '推上七节骨 100 次 → 揉龟尾 100 次',
      '<b>腹泻伴脱水（尿少、哭无泪、精神萎）须立即就医</b>，推拿不能替代补液'
    ]},
    {n:'小儿咳嗽（辅助）', for:'咳嗽有痰、胸闷，已在正规治疗中，推拿作辅助', steps:[
      '清肺经 200 次 → 分推膻中 50~100 次',
      '运八卦 200 次（宽胸化痰）',
      '揉肺俞 1 分钟 → 擦背部脊柱两侧至温热',
      '<b>咳嗽剧烈、伴喘息气促、发热不退、咳超过两周，须就医排查</b>；推拿不能替代药物治疗'
    ]},
    {n:'小儿鼻塞、流清涕', for:'受凉后鼻塞、睡觉张口呼吸、流清涕', steps:[
      '开天门 50~100 次 → 推坎宫 50~100 次（四大手法）',
      '揉迎香 30~50 次 → 搓热掌心捂住鼻部 30 秒，反复 3 遍',
      '揉外劳宫 200 次（温阳散寒）',
      '注意保暖避风；黄涕、发热、鼻塞超过一周须就诊'
    ]},
    {n:'成人落枕', for:'晨起颈部僵痛、转头受限（无外伤）', steps:[
      '<b>先排除颈椎病、外伤史；伴手麻、剧痛、头晕须先就医</b>',
      '按揉外劳宫（落枕穴）、后溪各 1~2 分钟，边按边缓慢活动颈部',
      '按揉风池、天柱、肩井各 1 分钟（孕妇禁拿肩井）',
      '热敷颈部 15 分钟；忌暴力扳颈、忌强行「掰响」'
    ]},
    {n:'痛经（原发性 · 轻）', for:'经期小腹冷痛、坠胀，尚可忍受（已排除器质性病变）', steps:[
      '经前 3~5 天开始，每天一次：揉三阴交、地机各 2 分钟',
      '揉关元 2 分钟 → 擦八髎至小腹温热',
      '热敷小腹 15 分钟，忌冷饮',
      '<b>进行性加重、止痛药无效、伴经期外腹痛，须妇科排查</b>'
    ]},
    {n:'成人腹胀、消化不良', for:'饭后腹胀、嗳气、胃口差', steps:[
      '饭后 1 小时再做：摩腹（顺时针）5 分钟',
      '按揉中脘、足三里各 2 分钟',
      '搓两胁：两手掌自上而下搓胁肋 30 次（疏肝理气）',
      '规律三餐、七分饱；反复腹胀消瘦、黑便、腹痛剧烈须就医'
    ]},
    {n:'成人颈肩僵痛', for:'久坐、低头后颈肩酸胀、转头不利', steps:[
      '拿风池 1 分钟 → 拿肩井 1 分钟（孕妇禁拿肩井）',
      '滚肩背 3~5 分钟，重点在肩胛内上角',
      '点按天宗、肩井、曲池、合谷各 30 秒',
      '自我拉伸：收下巴、扩胸、耸肩绕环各 10 次；持续手麻、无力须查颈椎'
    ]},
    {n:'成人腰背酸痛', for:'久坐久站后腰酸、弯腰起身困难', steps:[
      '滚腰背 5 分钟 → 按揉肾俞、大肠俞各 1 分钟',
      '擦八髎至温热 → 点委中 30 秒',
      '掌根按揉腰阳关、命门各 1 分钟',
      '<b>腰痛伴下肢放射痛、麻木、大小便异常，先就医排除椎间盘与马尾问题</b>'
    ]},
    {n:'成人失眠', for:'入睡难、易醒、多梦', steps:[
      '开天门 100 次 → 推坎宫 100 次 → 揉太阳 1 分钟（睡前，力度宜轻）',
      '按揉神门、内关、三阴交各 1 分钟',
      '摩腹（顺时针）5 分钟 → 擦涌泉至足心发热',
      '下午后少咖啡因，睡前一小时不看强光屏幕'
    ]},
    {n:'头痛、眼疲劳', for:'前额胀痛、眉棱骨痛、用眼过度', steps:[
      '抹前额：两拇指自眉心向两侧分推 30 次',
      '揉太阳 1 分钟 → 按揉攒竹、鱼腰、四白各 30 秒',
      '拿风池 1 分钟 → 按合谷 1 分钟（孕妇慎用合谷）',
      '突发剧烈头痛、伴呕吐或视物改变，须立即就医'
    ]}
  ];

  const CAUTION = [
    '皮肤：破损、烫伤、湿疹渗液、疖肿处不推；小儿皮肤娇嫩，须用介质（爽身粉、婴儿油），手法轻快柔和，频率约 200~300 次/分。',
    '急症：高热不退、抽搐、意识不清、剧烈腹痛、呕吐不止、脱水、骨折脱位、急性感染——先就医，推拿只能作辅助。',
    '特殊人群：孕妇腰骶部与合谷、三阴交、肩井等穴慎用或禁用；骨质疏松、肿瘤骨转移、严重心脑血管病者不做重手法。',
    '时间：饭后 1 小时内不摩腹；小儿推拿以晨起或睡前为宜，单次 10~20 分钟，不宜过久。',
    '扳法：颈椎扳法有椎动脉与脊髓损伤风险，必须由受过训练的专业人员操作并先排除禁忌，本站不建议自学。',
    '观察：操作中孩子哭闹加剧、面色改变、出汗多，立即停止；推拿后注意保暖、适当饮水。'
  ];

  let TAB = 'hand';

  function tuinaPage(params){
    const tb = params && params.get ? params.get('tab') : null;
    if(tb && ['hand','kid','routine'].includes(tb)) TAB = tb;
    return `<div class="view">
      <div class="between">
        <div>
          <h1 style="font-size:26px">推拿</h1>
          <p style="font-size:13px;color:var(--muted);margin-top:4px">成人手法 ${HAND.length} 种 · 小儿推拿（天河水五法 + ${KID.length} 穴 + 复式操作）· ${ROUTINE.length} 套家庭保健流程</p>
        </div>
      </div>

      <div class="tg-note" style="margin-top:14px">
        <b>先说清楚</b>　推拿是「用手法在体表做功」，<b>不能替代诊断与必要的药物治疗</b>。
        小儿推拿流派很多，同一个穴位在不同流派的方向、次数、寒温属性可能不同（尤其「天河水」），
        本页把主流说法并列写出，<b>以你所学教材与师承为准</b>；孩子高热、抽搐、精神差，先去医院。
      </div>

      <div class="chips" style="margin-top:14px" id="ttab">
        ${[['hand','成人手法'],['kid','小儿推拿'],['routine','保健套路']].map(([k, t]) => `<button class="chip ${TAB === k ? 'on brand' : ''}" data-ttab="${k}" style="font-size:12.5px">${t}</button>`).join('')}
      </div>
      <div id="tpanel">${panel()}</div>

      <div class="card" style="margin-top:18px">
        <h4 style="font-size:14px;margin-bottom:8px">相关页面</h4>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <a class="tag" href="#/acu" style="text-decoration:none">穴位库 · 认穴定位 ↗</a>
          <a class="tag" href="#/pulse" style="text-decoration:none">脉象 · 四诊之一 ↗</a>
          <a class="tag" href="#/tongue" style="text-decoration:none">舌诊 · 四诊之一 ↗</a>
          <a class="tag" href="#/disease" style="text-decoration:none">临床 · 病 → 证 → 方 ↗</a>
        </div>
      </div>
    </div>`;
  }

  function panel(){
    if(TAB === 'kid') return kidPanel();
    if(TAB === 'routine') return routinePanel();
    const GROUPS = [
      ['基础按摩', '按、揉、摩、擦、滚…力量柔和，自学自用最安全'],
      ['强刺激', '点、拨、拍…力量大或频率高，掌握好度再上'],
      ['关节手法', '摇、拔伸、扳…有风险，须受过训练，先排禁忌']
    ];
    return GROUPS.map(([g, hint]) => `<div class="sec" style="margin-top:16px"><h2>${g}</h2><span class="hint">${hint}</span></div>
    <div class="grid auto-320">
      ${HAND.filter(h => h.g === g).map((h, i) => `<div class="card tu-card">
        <div class="between" style="align-items:baseline">
          <h4 style="font-size:16px">${esc(h.n)}</h4><span class="tg-i">${h.n}</span>
        </div>
        <p class="tu-d">${esc(h.d)}</p>
        <p class="tu-kv"><b>适用</b>${esc(h.use)}</p>
        <p class="tu-key"><b>要领</b>${esc(h.key)}</p>
      </div>`).join('')}
    </div>`).join('') +
    `<div class="card" style="margin-top:14px;border-left:3px solid var(--danger)">
      <h4 style="font-size:14.5px;margin-bottom:6px">风险提示</h4>
      <p style="font-size:12.8px;line-height:1.95;color:var(--ink-2)">
        按、揉、摩、擦、拿、滚属于相对安全的手法，可以自学自用；<b>点法、拨法、扳法刺激强、风险高</b>，
        尤其颈椎扳法可能导致椎动脉损伤，务必由专业人员操作。有骨质疏松、肿瘤骨转移、出血倾向、发热感染时不做重手法。
      </p>
    </div>`;
  }

  function kidPanel(){
    const arrows = (mode, i) => {
      const defs = `<defs><marker id="ar${i}" markerWidth="9" markerHeight="9" refX="4.5" refY="4.5" orient="auto">
        <path d="M0 0 L9 4.5 L0 9 z" fill="var(--brand)"/></marker></defs>`;
      const arm = `<rect x="34" y="10" width="52" height="132" rx="26" fill="var(--brand)" fill-opacity=".055" stroke="var(--brand)" stroke-width="1.3"/>
      <line x1="60" y1="24" x2="60" y2="128" stroke="var(--line)" stroke-dasharray="3 4"/>`;
      const path = {
        up: `<path d="M60 120 L60 40" stroke="var(--brand)" stroke-width="3" marker-end="url(#ar${i})"/>`,
        down: `<path d="M60 40 L60 120" stroke="var(--brand)" stroke-width="3" marker-end="url(#ar${i})"/>`,
        tap: `<path d="M60 52 L60 116" stroke="var(--brand)" stroke-width="3" stroke-dasharray="7 5" marker-end="url(#ar${i})"/>
              <circle cx="60" cy="44" r="4" fill="var(--brand)"/>`,
        combo: `<path d="M46 120 L46 40" stroke="var(--brand)" stroke-width="2.4" marker-end="url(#ar${i})"/>
              <path d="M74 40 L74 120" stroke="var(--danger)" stroke-width="2.4" marker-end="url(#ar${i})"/>`
      }[mode] || '';
      return `<svg viewBox="0 0 120 160" class="tu-arm">${defs}${arm}${path}
      <text x="60" y="8" text-anchor="middle" class="tu-arm-t">肘（洪池）</text>
      <text x="60" y="155" text-anchor="middle" class="tu-arm-t">腕（总筋）</text>
    </svg>`;
    };
    const dirLabel = {up:'腕 → 肘', down:'肘 → 腕', tap:'弹打', combo:'双线交替'};
    const acuLink = n => {
      const a = (window.ACU && window.ACU.byName && window.ACU.byName[n]) || null;
      return a ? `<a class="tag" href="#/acu?p=${encodeURIComponent(a.n)}" style="font-size:10.5px;text-decoration:none">${a.n} 在穴位库 ↗</a>` : '';
    };
    const grads = TIANHE.slice().sort((a,b)=>a.rank-b.rank).map(t =>
      `<div class="tu-grad-i"><span class="dot" data-w="${t.rank}"></span><b>${esc(t.n)}</b><i>${esc(t.xing.replace(/^性/,''))}</i></div>`).join('');
    return `<div class="sec" style="margin-top:16px"><h2>天河水五法</h2><span class="hint">同一条线，方向不同寒温就不同</span></div>
    <div class="card tu-tianhe-intro">
      <p style="font-size:13.4px;line-height:1.95;color:var(--ink-2)">
        <b>位置</b>　前臂正中，腕横纹（总筋）至肘横纹（洪池）成一直线，左右手各一。
        <br><b>为什么叫「天河水」</b>　古人以此线比作天上的银河，推之能「引天河之水」以清热，故得名。
        <br><b>一个线、五六个名</b>　清、取、引水上天河、大推、打马过天河——方向、蘸水、弹打、联用各有讲究。
        <b>方向不同、寒凉程度就不同</b>：向心（腕→肘）性微凉平和；离心或蘸水弹打性大凉。这是初学者最容易混的一处。
      </p>
    </div>
    <div class="card" style="margin-top:12px">
      <h4 style="font-size:13.5px;margin-bottom:8px">寒温梯度（温和 → 峻凉，由左到右）</h4>
      <div class="tu-grad">${grads}</div>
      <p class="mini" style="margin-top:8px">寒凉越大越「峻」，热退即止、不宜久用；脾虚易腹泻的孩子慎用大凉诸法。</p>
    </div>
    <div class="grid auto-340" style="margin-top:14px">
      ${TIANHE.slice().sort((a,b)=>a.rank-b.rank).map((t, i) => `<div class="card tu-th">
        <div class="between" style="align-items:baseline">
          <h4 style="font-size:16.5px">${esc(t.n)}</h4><span class="tag ${t.xing.includes('大凉') ? 'brand' : ''}">${esc(t.xing)}</span>
        </div>
        <div class="tu-th-body">
          <div class="tu-th-fig">${arrows(t.mode, i)}<div class="tu-th-dir">${dirLabel[t.mode] || ''}</div></div>
          <div class="tu-th-txt">
            <p class="tu-kv"><b>方向</b>${esc(t.dir)}</p>
            <p class="tu-kv"><b>主治</b>${esc(t.zhu)}</p>
            <p class="tu-kv"><b>用于</b>${esc(t.use)}</p>
            <p class="tu-kv"><b>次数</b>${esc(t.num)}</p>
          </div>
        </div>
        <p class="tu-key"><b>注意</b>${esc(t.note)}</p>
      </div>`).join('')}
    </div>

    <div class="sec"><h2>天河水以外的清热 / 温法</h2><span class="hint">别把温法当清法用</span></div>
    <div class="card" style="padding:0;overflow:hidden">
      <div class="tbl-wrap"><table class="tbl tu-tbl">
        <thead><tr><th>名称</th><th>位置与操作</th><th>寒温</th><th>用于</th></tr></thead>
        <tbody>${KIDHEAT.map(k => `<tr>
          <td><b style="font-family:var(--serif)">${esc(k.n)}</b></td>
          <td>${esc(k.pos)}</td>
          <td><span class="tag ${k.xing === '温' ? 'jade' : 'brand'}">${esc(k.xing)}</span></td>
          <td>${esc(k.use)}</td>
        </tr>`).join('')}</tbody>
      </table></div>
    </div>

    <div class="sec"><h2>其他常用穴与操作</h2><span class="hint">位置 · 方向 · 主治</span></div>
    <div class="card" style="padding:0;overflow:hidden">
      <div class="tbl-wrap"><table class="tbl tu-tbl">
        <thead><tr><th>名称</th><th>位置</th><th>操作</th><th>功效</th><th>常用于</th></tr></thead>
        <tbody>${KID.map(k => {
          const ln = /迎香|膻中|外劳宫/.test(k.n) ? acuLink(k.n) : '';
          return `<tr>
          <td><b style="font-family:var(--serif)">${esc(k.n)}</b></td>
          <td>${esc(k.loc)}</td><td>${esc(k.op)}</td><td>${esc(k.zhu)}${ln}</td><td>${esc(k.use)}</td>
        </tr>`;}).join('')}</tbody>
      </table></div>
    </div>
    <p class="mini" style="margin-top:8px">想系统认穴（361 经穴 + 奇穴，含定位与按压方法），去 <a href="#/acu">穴位库</a> 按经脉浏览。</p>

    <div class="sec"><h2>复式操作</h2><span class="hint">几个动作连起来做</span></div>
    <div class="grid auto-300">
      ${FUSHI.map(f => `<div class="card tu-card">
        <h4 style="font-size:15px">${esc(f.n)}</h4>
        <p class="tu-d">${esc(f.d)}</p>
        <p class="tu-kv"><b>用于</b>${esc(f.use)}</p>
      </div>`).join('')}
    </div>`;
  }

  function routinePanel(){
    const kids = ROUTINE.filter(r => r.n.startsWith('小儿'));
    const adults = ROUTINE.filter(r => !r.n.startsWith('小儿'));
    const card = r => `<div class="card tu-rt">
        <h4 style="font-size:15.5px">${esc(r.n)}</h4>
        <p class="mini" style="margin:4px 0 8px">适用于：${esc(r.for)}</p>
        <ol class="tu-steps">${r.steps.map(s => `<li>${s}</li>`).join('')}</ol>
      </div>`;
    return `<div class="sec" style="margin-top:16px"><h2>小儿保健</h2><span class="hint">${kids.length} 套 · 手法轻快柔和，务必配合介质</span></div>
    <div class="grid auto-340">${kids.map(card).join('')}</div>
    <div class="sec" style="margin-top:18px"><h2>成人保健</h2><span class="hint">${adults.length} 套 · 力度以酸胀舒适为度</span></div>
    <div class="grid auto-340">${adults.map(card).join('')}</div>
    <div class="card" style="margin-top:16px;border-left:3px solid var(--danger)">
      <h4 style="font-size:15px;margin-bottom:8px">什么情况下不要推拿</h4>
      <ul class="tu-cau">${CAUTION.map(c => `<li>${esc(c)}</li>`).join('')}</ul>
    </div>`;
  }

  function bindTuina(){
    const tab = document.getElementById('ttab');
    if(!tab) return;
    tab.onclick = e => {
      const b = e.target.closest('[data-ttab]'); if(!b) return;
      TAB = b.dataset.ttab;
      [...tab.children].forEach(x => { x.classList.toggle('on', x === b); x.classList.toggle('brand', x === b); });
      const p = document.getElementById('tpanel');
      if(p) p.innerHTML = panel();
      if(history.replaceState) history.replaceState(null, '', '#/tuina?tab=' + TAB);
    };
  }

  window.TUINA = { hand: HAND, tianhe: TIANHE, kidheat: KIDHEAT, kid: KID, fushi: FUSHI, routine: ROUTINE, caution: CAUTION };
  window.PAGES = Object.assign(window.PAGES || {}, { tuina: tuinaPage });
  window.PAGE_BIND = Object.assign(window.PAGE_BIND || {}, { tuina: bindTuina });
})();
