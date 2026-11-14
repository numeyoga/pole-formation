import {test,expect,vi,beforeEach,afterEach} from 'vitest';
const NativeRequest=Request;
beforeEach(()=>{vi.resetModules();vi.stubGlobal('Request',class extends NativeRequest{constructor(input:RequestInfo|URL,init?:RequestInit){super(typeof input==='string'?new URL(input,'http://localhost'):input,init);}});});
afterEach(()=>vi.unstubAllGlobals());
test('activity mapping preserves cancelled headcounts and explicit UTC dates without recalculating indicators',async()=>{
 const fetch=vi.fn().mockResolvedValue(Response.json({items:[{id:'s',formationId:'f',title:'Session',state:'ANNULEE',firstSlotStart:'2001-01-31T09:00Z',participations:{registered:2,present:1,absent:3,withdrawn:4}}],total:1,page:2,size:10}));vi.stubGlobal('fetch',fetch);
 const {reportingApi}=await import('./reporting-api');expect(await reportingApi.sessions({from:'2001-01-01T00:00Z',until:'2001-02-01T00:00Z'},2)).toEqual({items:[{id:'s',title:'Session',status:'Annulée',firstSlot:'31/01/2001 09:00 UTC',counts:{registered:2,present:1,absent:3,withdrawn:4}}],total:1,page:2,size:10});expect(new URL((fetch.mock.calls[0][0] as Request).url).searchParams.get('page')).toBe('2');
});
