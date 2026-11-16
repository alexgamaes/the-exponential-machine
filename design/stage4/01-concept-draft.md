# Stage 4 concept draft (lead, Nov 15) — work in progress, NOT tuned

The expert agents stalled (service slowness), so the lead started the design alone. Not yet reviewed by UX, plot or a critic.

## Mechanic (draft)
- **Main button "Write code"**: adds lines of code (fades as programmers take over). No click upgrades.
- **Programmers** (paid with money) either **write** or **fix**: `Writing 16 [−][+] Fixing 8`.
- Every line adds hidden **bugs**; users find them and they become **bug reports**, a pile that grows by itself.
  Reports scare off new buyers: appeal = (lines/1000)^0.5 / (1 + reports / (R0·√programmers)).
- **Users** buy copies ($99, money) and only ever grow. Every user's computer counts for you:
  speed = legacy + users × per-user speed. Per-user speed doubles every 1.5 game years (hardware) × code ideas.
- **Twist (~minute 7, 1989): the network.** Users want to go online; **servers** (money) give room. Connected users count
  × (connected/1000)^0.25. Money is now split between programmers and servers.
- Choice card (1991) "Open or closed": Open = bugs fixed ×3; Closed = each copy earns ×2.
- Automation: "A bug tracker" moves programmers between writing and fixing for you (togglable).
- Goal: go online (operations in total); finale: give the browser away (money), then "Go online".

## Prototype (`design/stage4/proto.mjs`, run `node design/stage4/proto.mjs smart --verbose --set=k=v,...`)
Bots: smart, half (fixed 50/50), allfix, nofix, nonet (no servers), noclick, lazy.
- v1 numbers (defaults): speed flat for 8 min (users add nothing next to the 8×10¹¹ legacy); smart 17 min; 50/50 split
  as good as smart → the split is not a real decision yet.
- v2 (`--set=perUser=5e7,base=30,bugsPerLine=0.1,progFix=2,R0=20,progCost=20000,goal=1e19`): far too fast (3.7 min),
  money floods, the network never needed; never fixing is 3× slower (bugs bite), but a 50/50 split still ≈ smart.

## Next steps
1. Retune: users must matter from minute 1 without exploding (scale buyers and per-user speed, slow money with
   pricier programmers), target 12–15 min, doubling ≤ 50 s, quiet ≤ 45 s.
2. Make the split a real decision: the best writing/fixing share must move during the stage (bug ideas, the network
   raising bug discovery, Open/Closed), so a fixed split loses clearly.
3. Story and history (the plot writer's job), UX sketch, critic pass; then merge into `design/08-stage4.md`.
