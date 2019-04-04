import HandgraderRoster from '@/components/course_admin/roster/handgrader_roster.vue';
import Roster from '@/components/course_admin/roster/roster.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester, User } from 'ag-client-typescript';
import * as sinon from 'sinon';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('HandgraderRoster tests', () => {
    let wrapper: Wrapper<HandgraderRoster>;
    let component: HandgraderRoster;
    let user_1: User;
    let user_2: User;
    let user_3: User;
    let user_4: User;
    let new_user_1: User;
    let new_user_2: User;
    let course: Course;
    let handgraders: User[];
    let updated_handgraders: User[];
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        course = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });
        user_1 = new User({
            pk: 1,
            username: "coolmom@umich.edu",
            first_name: "Amy",
            last_name: "Poehler",
            email: "coolmom@umich.edu",
            is_superuser: true
        });
        user_2 = new User({
            pk: 2,
            username: "amandaplease@umich.edu",
            first_name: "Amanda",
            last_name: "Bynes",
            email: "amandaplease@umich.edu",
            is_superuser: true
        });
        user_3 = new User({
            pk: 3,
            username: "worldsbestboss@umich.edu",
            first_name: "Steve",
            last_name: "Carell",
            email: "worldsbestbo$$@umich.edu",
            is_superuser: true
        });
        user_4 = new User({
            pk: 3,
            username: "freshPrince@umich.edu",
            first_name: "Will",
            last_name: "Smith",
            email: "freshPrince@umich.edu",
            is_superuser: true
        });
        new_user_1 = new User({
            pk: 4,
            username: "letitsnow@umich.edu",
            first_name: "Brittany",
            last_name: "Snow",
            email: "letitsnow@umich.edu",
            is_superuser: true
        });
        new_user_2 = new User({
            pk: 5,
            username: "sevenEleven@umich.edu",
            first_name: "Millie",
            last_name: "Brown",
            email: "sevenEleven@umich.edu",
            is_superuser: true
        });

        original_match_media = window.matchMedia;
        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        handgraders = [user_1, user_2, user_3, user_4];
        updated_handgraders = [user_1, user_2, user_3, user_4, new_user_1, new_user_2];

        let get_handgraders_stub = sinon.stub(course, 'get_handgraders');
        get_handgraders_stub.onFirstCall().returns(Promise.resolve(handgraders));
        get_handgraders_stub.onSecondCall().returns(Promise.resolve(updated_handgraders));

        wrapper = mount(HandgraderRoster, {
            propsData: {
                course: course
            }
        });
        component = wrapper.vm;
    });

    afterEach(() => {
        sinon.restore();

        Object.defineProperty(window, "matchMedia", {
            value: original_match_media
        });

        if (wrapper.exists()) {
            wrapper.destroy();
        }
    });

    test('The created function calls the Course method "get_handgraders"', async () => {
        await component.$nextTick();

        expect(component.d_course).toEqual(course);
        expect(component.handgraders).toEqual(handgraders);
    });

    test('Clicking the "Add to Roster" button with valid input prompts the Course ' +
         'add_handgraders method to be called',
         async () => {
        let add_handgraders_stub = sinon.stub(course, 'add_handgraders');
        await component.$nextTick();

        expect(component.d_course).toEqual(course);
        expect(component.handgraders).toEqual(handgraders);

        let roster = <Roster> wrapper.find({ref: 'handgrader_roster'}).vm;
        roster.users_to_add = new_user_1.username + " " + new_user_2.username;
        await component.$nextTick();

        let add_handgraders_form = wrapper.find('#add-users-form');
        add_handgraders_form.trigger('submit');
        await component.$nextTick();

        expect(add_handgraders_stub.firstCall.calledWith(
            new_user_1.username + " " + new_user_2.username)
        );
        expect(component.handgraders).toEqual(updated_handgraders);
    });

    test('Deleting a user from the roster causes the Course "remove_handgraders" method to' +
         ' be called ',
         async () => {
        let remove_handgraders_stub = sinon.stub(course, 'remove_handgraders');
        await component.$nextTick();

        expect(component.d_course).toEqual(course);
        expect(component.handgraders).toEqual(handgraders);

        let remove_user_buttons = wrapper.find({ref: 'handgrader_roster'}).findAll('.remove-user');
        remove_user_buttons.at(1).trigger('click');
        await component.$nextTick();

        expect(remove_handgraders_stub.firstCall.calledWith([user_1])).toBe(true);
    });
});