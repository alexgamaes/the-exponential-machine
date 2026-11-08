import sys
CFG = dict(
  clicks=[(0,4),(90,3),(240,2),(420,1.5)],          # player clicks/s by time (casual-active player)
  P={'clerk':dict(c0=10,g=1.12,r=0.5),'bombe':dict(c0=600,g=1.12,r=8)},
  goal=250000,
)
U = [ # id, cost, effect, reveal
 ('pencil',     15, ('click_mul',2),        lambda s: s['clicks']>=10),
 ('rota',       60, ('mul','clerk',2),      lambda s: s['n']['clerk']>=3),
 ('cribs',     180, ('click_pct',0.05),     lambda s: s['L']>=120),
 ('zygalski',  450, ('mul','clerk',2),      lambda s: s['n']['clerk']>=10),
 ('blueprint', 1000,('unlock','bombe'),     lambda s: s['L']>=600),
 ('wrens',     2200,('mul','bombe',2),      lambda s: s['n']['bombe']>=2),
 ('hollerith', 4500,('mul','clerk',2),      lambda s: s['L']>=4000),
 ('diagonal',  8000,('mul','bombe',2),      lambda s: s['n']['bombe']>=6),
 ('letter',   14000,('choice',),            lambda s: s['L']>=12000),
 ('hut8',     24000,('synergy',0.02),       lambda s: s['n']['bombe']>=12),
 ('usnavy',   40000,('mul','bombe',2),      lambda s: s['L']>=35000),
 ('typex',    65000,('mul','all',1.5),      lambda s: s['L']>=60000),
 ('shark',   250000,('goal',),              lambda s: True),
]
def clickrate(t):
    c=0
    for a,b in CFG['clicks']:
        if t>=a: c=b
    return c
def run(choice='A', clickscale=1.0, verbose=True):
    P=CFG['P']
    s=dict(ops=0.0,L=0.0,clicks=0,n={'clerk':0,'bombe':0},mul={'clerk':1,'bombe':1},click=1,cp=0,unl={'bombe':False},g={k:P[k]['g'] for k in P},syn=0)
    bought=set(); rev={}; t=0; dt=0.1; ev=[]; last=0; gaps=[]; snaps=[]
    def rate():
        r=s['n']['clerk']*P['clerk']['r']*s['mul']['clerk']*(1+s['syn']*s['n']['bombe'])
        r+=s['n']['bombe']*P['bombe']['r']*s['mul']['bombe']
        return r
    cost=lambda k:P[k]['c0']*s['g'][k]**s['n'][k]
    while t<2400:
        R=rate(); cr=clickrate(t)*clickscale; cv=s['click']+s['cp']*R
        gain=(R+cr*cv)*dt; s['ops']+=gain; s['L']+=gain; s['clicks']+=cr*dt; t+=dt
        for u in U:
            if u[0] not in rev and u[3](s): rev[u[0]]=t; ev.append((t,'reveal',u[0]))
        while True:
            did=False
            for u in U:
                if u[0] in rev and u[0] not in bought and s['ops']>=u[1]:
                    s['ops']-=u[1]; bought.add(u[0]); e=u[2]; did=True
                    if e[0]=='click_mul': s['click']*=e[1]
                    elif e[0]=='mul':
                        for k in (['clerk','bombe'] if e[1]=='all' else [e[1]]): s['mul'][k]*=e[2]
                    elif e[0]=='click_pct': s['cp']+=e[1]
                    elif e[0]=='unlock': s['unl']['bombe']=True
                    elif e[0]=='synergy': s['syn']+=e[1]
                    elif e[0]=='choice':
                        if choice=='A': s['g']['bombe']=1.07
                        else: s['cp']+=0.25
                    elif e[0]=='goal':
                        ev.append((t,'GOAL',''))
                    ev.append((t,'BUY',u[0])); gaps.append(t-last); last=t
            if 'shark' in bought: break
            opts=[k for k in P if k=='clerk' or s['unl']['bombe']]
            k=max(opts,key=lambda k:P[k]['r']*s['mul'][k]/cost(k))
            nxt=[u[1] for u in U if u[0] in rev and u[0] not in bought]
            save = nxt and min(nxt)>s['ops'] and min(nxt)<s['ops']+(R+cr*cv)*30
            if s['L']>=8 and s['ops']>=cost(k) and not save:
                s['ops']-=cost(k); s['n'][k]+=1; did=True; gaps.append(t-last); last=t
            if not did: break
        if 'shark' in bought: break
        if abs(t%60)<dt/2 or abs(t%60-60)<dt/2: snaps.append((round(t/60),round(R),round(cv,1),s['n']['clerk'],s['n']['bombe'],int(s['L']),round(10000/(R+cr*cv),1)))
    if verbose:
        for e in ev: print('%5.0fs %-6s %s'%e)
        print('min ops/s click clerks bombes lifetime  sec_per_10k_ops("the task")')
        for x in snaps: print(x)
        print('END t=%.0fs (%.1f min) max gap between any purchase=%.0fs final ops/s=%.0f'%(t,t/60,max(gaps),rate()))
    return t
if __name__=='__main__':
    run(sys.argv[1] if len(sys.argv)>1 else 'A', float(sys.argv[2]) if len(sys.argv)>2 else 1.0)
