import { type Character } from "~/common/types";

export const kirby: Character = {
  scale: 0.92,
  shieldOffset: [0, 4.828],
  shieldSize: 0.92 * 14.7,
  animationMap: new Map<string, string>([
    ["AppealL", "AppealL"],
    ["AppealR", "AppealR"],
    ["AttackS3Hi", "AttackS3Hi"],
    ["AttackS3HiS", "AttackS3Hi"],
    ["AttackS3Lw", "AttackS3Lw"],
    ["AttackS3LwS", "AttackS3Lw"],
    ["AttackS3S", "AttackS3S"],
    ["AttackS4Hi", "AttackS4Hi"],
    ["AttackS4HiS", "AttackS4Hi"],
    ["AttackS4Lw", "AttackS4Lw"],
    ["AttackS4LwS", "AttackS4Lw"],
    ["AttackS4S", "AttackS4S"],
    ["BarrelWait", ""],
    ["Bury", ""],
    ["BuryJump", ""],
    ["BuryWait", ""],
    ["CaptureCaptain", ""],
    ["CaptureDamageKoopa", ""],
    ["CaptureDamageKoopaAir", ""],
    ["CaptureKirby", ""],
    ["CaptureKirbyYoshi", ""],
    ["CaptureKoopa", ""],
    ["CaptureKoopaAir", ""],
    ["CaptureMewtwo", ""],
    ["CaptureMewtwoAir", ""],
    ["CaptureWaitKirby", ""],
    ["CaptureWaitKoopa", ""],
    ["CaptureWaitKoopaAir", ""],
    ["CaptureYoshi", ""],
    ["CatchDashPull", "CatchWait"],
    ["CatchPull", "CatchWait"],
    ["DamageBind", ""],
    ["DamageIce", ""],
    ["DamageIceJump", "Fall"],
    ["DamageSong", ""],
    ["DamageSongRv", ""],
    ["DamageSongWait", ""],
    ["DeadDown", ""],
    ["DeadLeft", ""],
    ["DeadRight", ""],
    ["DeadUpFallHitCamera", ""],
    ["DeadUpFallHitCameraIce", ""],
    ["DeadUpFallIce", ""],
    ["DeadUpStar", ""],
    ["DeadUpStarIce", ""],
    ["DownReflect", ""],
    ["EntryEnd", "Entry"],
    ["EntryStart", "Entry"],
    ["Escape", "EscapeN"],
    ["FlyReflectCeil", ""],
    ["FlyReflectWall", "WallDamage"],
    ["Guard", "Guard"],
    ["GuardOff", "GuardOff"],
    ["GuardOn", "GuardOn"],
    ["GuardReflect", "Guard"],
    ["GuardSetOff", "GuardDamage"],
    ["ItemParasolDamageFall", ""],
    ["ItemParasolFall", ""],
    ["ItemParasolFallSpecial", ""],
    ["ItemParasolOpen", ""],
    ["KirbyYoshiEgg", ""],
    ["KneeBend", "Landing"],
    ["LandingFallSpecial", "Landing"],
    ["LiftTurn", ""],
    ["LiftWait", ""],
    ["LiftWalk1", ""],
    ["LiftWalk2", ""],
    ["LightThrowAirB4", "LightThrowAirB"],
    ["LightThrowAirF4", "LightThrowAirF"],
    ["LightThrowAirHi4", "LightThrowAirHi"],
    ["LightThrowAirLw4", "LightThrowAirLw"],
    ["LightThrowB4", "LightThrowB"],
    ["LightThrowF4", "LightThrowF"],
    ["LightThrowHi4", "LightThrowHi"],
    ["LightThrowLw4", "LightThrowLw"],
    ["Rebirth", "Entry"],
    ["RebirthWait", "Wait1"],
    ["ReboundStop", "Rebound"],
    ["RunDirect", ""],
    ["ShieldBreakDownD", "DownBoundD"],
    ["ShieldBreakDownU", "DownBoundU"],
    ["ShieldBreakFall", "DamageFall"],
    ["ShieldBreakFly", ""],
    ["ShieldBreakStandD", "DownStandD"],
    ["ShieldBreakStandU", "DownStandU"],
    ["ShoulderedTurn", ""],
    ["ShoulderedWait", ""],
    ["ShoulderedWalkFast", ""],
    ["ShoulderedWalkMiddle", ""],
    ["ShoulderedWalkSlow", ""],
    ["SwordSwing1", "Swing1"],
    ["SwordSwing3", "Swing3"],
    ["SwordSwing4", "Swing4"],
    ["SwordSwingDash", "SwingDash"],
    ["ThrownB", ""],
    ["ThrownCopyStar", ""],
    ["ThrownF", ""],
    ["ThrownFB", ""],
    ["ThrownFF", ""],
    ["ThrownFHi", ""],
    ["ThrownFLw", ""],
    ["ThrownHi", ""],
    ["ThrownKirby", ""],
    ["ThrownKirbyStar", ""],
    ["ThrownKoopaAirB", ""],
    ["ThrownKoopaAirF", ""],
    ["ThrownKoopaB", ""],
    ["ThrownKoopaF", ""],
    ["ThrownLw", ""],
    ["ThrownLwWomen", ""],
    ["ThrownMewtwo", ""],
    ["ThrownMewtwoAir", ""],
    ["Wait", "Wait1"],
    ["YoshiEgg", ""],
  ]),
  specialsMap: new Map<number, string>([
    [341, "JumpAerialF1"],
    [342, "JumpAerialF2"],
    [343, "JumpAerialF3"],
    [344, "JumpAerialF4"],
    [345, "JumpAerialF5"],
    [346, "JumpAerialF1Met"],
    [347, "JumpAerialF2Met"],
    [348, "JumpAerialF3Met"],
    [349, "JumpAerialF4Met"],
    [350, "JumpAerialF5Met"],
    [351, "AttackDash"],
    [352, "AttackDash"],
    [353, "SpecialN"], // Ground Startup (Drink?)
    [354, "SpecialNLoop"],
    [355, "SpecialNEnd"],
    [356, "Eat"], // Capture (Eat?)
    [357, ""], // ???
    [358, ""], // Captured (used as swallowed character state? or is that ThrownKirby?)
    [359, "EatWait"],
    [360, "EatWalkSlow"],
    [361, "EatWalkMiddle"],
    [362, "EatWalkFast"],
    [363, "EatTurn"],
    [364, "EatLanding"],
    [365, "EatJump1"],
    [366, "EatLanding"],
    [367, "SpecialNDrink"], // Digest (Drink?)
    [368, ""], // ???
    [369, "SpecialNSpit"], // Spit
    [370, ""], // ???
    [371, "SpecialN"], // Air Startup (Drink?)
    [372, "SpecialNLoop"],
    [373, "SpecialNEnd"],
    [374, "Eat"], // Air Capture (Eat?)
    [375, ""], // ???
    [376, ""], // Air Captured (see 358)
    [377, "EatWait"],
    [378, "SpecialNDrink"], // Air Digest (Drink?)
    [379, ""], // ???
    [380, "SpecialNSpit"], // Air Spit
    [381, ""], // ???
    [382, "EatTurn"],
    [383, "SpecialS"],
    [384, "SpecialAirS"],
    [385, "SpecialHi1"],
    [386, "SpecialHi2"],
    [387, "SpecialHi3"],
    [388, "SpecialHi4"],
    [389, "SpecialAirHi1"],
    [390, "SpecialAirHi2"],
    [391, "SpecialAirHi3"],
    [392, "SpecialAirHi4"],
    [393, "SpecialLw1"],
    [394, "SpecialLw1"],
    [395, "SpecialLw2"],
    [396, "SpecialAirLw1"],
    [397, "SpecialAirLw1"],
    [398, "SpecialAirLw2"],
    // 399 - 537 are hat neutralBs
  ]),
};
