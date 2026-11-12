/** A product of Jewel, a member of it who manages Jewel and one who does not, and a page in Jewel's brain, as the product brain tests use them. */
export const productId = '00000000-0000-0000-0000-0000000000c1';

export const otherProductId = '00000000-0000-0000-0000-0000000000c2';

export const portal = { id: productId, name: 'Jewel portal', organisationId: 'jewel' };

export const elsewhere = { id: otherProductId, name: 'Elsewhere', organisationId: 'other' };

export const processPage = { pageId: '00000000-0000-0000-0000-00000000000a', partKind: 'process', parentPageId: null, title: 'Opening hours' };

const membership = (isManager: boolean) => [{ organisationId: 'jewel', accountId: 'nigel', isManager }];

const onProducts = { ownedProjectIds: [], memberProjectIds: [productId, otherProductId] };

export const nigelManagingJewel = { accountId: 'nigel', isStaff: false, organisationMemberships: membership(true), ...onProducts };

export const nigelOnJewel = { ...nigelManagingJewel, organisationMemberships: membership(false) };

export const stuartOnPortal = { accountId: 'stuart', isStaff: false, organisationMemberships: [], ...onProducts };

export const stuartOffPortal = { ...stuartOnPortal, memberProjectIds: [] };
