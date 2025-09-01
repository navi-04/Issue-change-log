import Resolver from '@forge/resolver';
import getText from './getText';
import devMounika from './devMounika';
import devNaveenraj from './devNaveenraj';
import devSahanaa from './devSahanaa';
import devSuvitha from './devSuvitha';

const resolver = new Resolver();

resolver.define('getText', getText);
resolver.define('devMounika', devMounika);
resolver.define('devNaveenraj', devNaveenraj);
resolver.define('devSahanaa', devSahanaa);
resolver.define('devSuvitha', devSuvitha);



export const handler = resolver.getDefinitions();
