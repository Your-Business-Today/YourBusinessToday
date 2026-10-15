import { describe, expect, it } from 'vitest';
import { portalOriginFor, portalReroute, siteDoorFor } from './siteDoors';

const portalHost = 'portal.yourbusiness.today';

describe('siteDoorFor', () => {
	it('knows the production portal and points back at yourbusiness.today', () => {
		const door = siteDoorFor(new URL('https://portal.yourbusiness.today/'), portalHost);
		expect(door).toEqual({ isPortal: true, otherDoorOrigin: 'https://yourbusiness.today' });
	});

	it('knows yourbusiness.today and points at the portal', () => {
		const door = siteDoorFor(new URL('https://yourbusiness.today/projects'), portalHost);
		expect(door).toEqual({ isPortal: false, otherDoorOrigin: 'https://portal.yourbusiness.today' });
	});

	it('treats portal.localhost as the portal of localhost in development', () => {
		const portalDoor = siteDoorFor(new URL('http://portal.localhost:5173/'), portalHost);
		const staffDoor = siteDoorFor(new URL('http://localhost:5173/'), portalHost);
		expect(portalDoor).toEqual({ isPortal: true, otherDoorOrigin: 'http://localhost:5173' });
		expect(staffDoor).toEqual({ isPortal: false, otherDoorOrigin: 'http://portal.localhost:5173' });
	});

	it('lets a configured preview host stand in as the portal', () => {
		const previewHost = 'ybt-portal-preview.vercel.app';
		const door = siteDoorFor(new URL(`https://${previewHost}/`), previewHost);
		expect(door).toEqual({ isPortal: true, otherDoorOrigin: 'https://yourbusiness.today' });
	});
});

describe('portalOriginFor', () => {
	it('turns the staff origin into the portal origin', () => {
		expect(portalOriginFor('https://yourbusiness.today', portalHost)).toBe(
			'https://portal.yourbusiness.today'
		);
	});

	it('keeps a portal origin as it is', () => {
		expect(portalOriginFor('https://portal.yourbusiness.today', portalHost)).toBe(
			'https://portal.yourbusiness.today'
		);
	});
});

describe('portalReroute', () => {
	it('serves the portal home at the portal front door', () => {
		expect(portalReroute(new URL('https://portal.yourbusiness.today/'), portalHost)).toBe('/portal');
	});

	it('serves a project page on the portal from inside the portal route', () => {
		const projectPage = new URL('https://portal.yourbusiness.today/projects/project-1');
		expect(portalReroute(projectPage, portalHost)).toBe('/portal/projects/project-1');
	});

	it('serves the organisation’s people page from inside the portal route', () => {
		const peoplePage = new URL('https://portal.yourbusiness.today/people');
		expect(portalReroute(peoplePage, portalHost)).toBe('/portal/people');
	});

	it('serves the connect your Claude page from inside the portal route', () => {
		const connectPage = new URL('https://portal.yourbusiness.today/connect');
		expect(portalReroute(connectPage, portalHost)).toBe('/portal/connect');
	});

	it('leaves deeper project paths and the staff host’s project pages alone', () => {
		const taskPage = new URL('https://portal.yourbusiness.today/projects/project-1/tasks/task-1');
		const staffProjectPage = new URL('https://yourbusiness.today/projects/project-1');
		expect(portalReroute(taskPage, portalHost)).toBeUndefined();
		expect(portalReroute(staffProjectPage, portalHost)).toBeUndefined();
	});

	it('leaves every other path and host alone', () => {
		const signIn = new URL('https://portal.yourbusiness.today/account/sign-in');
		expect(portalReroute(signIn, portalHost)).toBeUndefined();
		expect(portalReroute(new URL('https://yourbusiness.today/'), portalHost)).toBeUndefined();
	});
});
