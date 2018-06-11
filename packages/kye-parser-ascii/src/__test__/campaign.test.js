import Campaign from 'potato-engine/campaign';
import { parse, serialize } from '../campaign';

// From KIDS.KYE
const TEST_CAMPAIGN = `2
KNIFE
Remove the knife
Ouch, he cut his finger on the knife
555555555555555555555555555555
5                            5
5              75555559      5
5              1eeeeeee9     5
5               1559eeee9    5
5  75555555555559eee1eeee9   5
5 4eeeeeeeeeeeeeeeeee1eeee9  5
5  155555F2222222eeeeeeeee1555
5        *K8888888eeeeeeeeeee5
5       **4eeeeeee6eeeeeeeeee5
5      *** 2222222eeeeeeeeeee5
5     ****  8888888eeeeeeeeee5
5    ****  4eeeeeee6eeeeeeeee5
5   *****   2222223eeeeeeeeee5
5  7****     8888888eeeeeeeee5
5 75***     4eeeeeee6eeeeee755
3755**       1532222eeeeee3  5
7555*           1555555553   5
5553                         5
553755555555555555555555555555
BIKER
Don't wait too long
Well done
555555555555555555555555555555
5           ***              5
5            ***             5
5  K         ****            5
5          *******           5
5         **   ***           5
5    59  bb   ***  **  *     5
5    *55b    **7598***8  *   5
5    53 b    *75535***5      5
5       bb   *  b 15553   *  5
5      cabb* *  b bca 75     5
5     c^ abb** bbbc^ a1F    *5
5    cvca abbSs Scvca a1     5
5    a ac^c sbbb a ac^c      5
5     a vc   S sSSa vc       5
5      cc          cc        5
588888888888888888888888888885
5TTTTTTTTTTTTTTTTTTTTTTTTTTTT5
5TTTTTTTTTTTTTTTTTTTTTTTTTTTT5
555555555555555555555555555555
`;

it('parses', () => {
    const result = parse(TEST_CAMPAIGN);
    expect(result).to.be.instanceof(Campaign);
});
