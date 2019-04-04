import APIErrors from '@/components/api_errors.vue';
import CourseSettings from '@/components/course_admin/course_settings.vue';
import ValidatedForm from '@/components/validated_form.vue';
import ValidatedInput from '@/components/validated_input.vue';
import { config, mount, Wrapper } from '@vue/test-utils';
import { Course, Semester } from 'ag-client-typescript';
import { AxiosError } from 'axios';
import * as sinon from 'sinon';

beforeAll(() => {
    config.logModifiedComponents = false;
});

describe('CourseSettings.vue', () => {
    let wrapper: Wrapper<CourseSettings>;
    let component: CourseSettings;
    let course_1: Course;
    let original_match_media: (query: string) => MediaQueryList;

    beforeEach(() => {
        course_1 = new Course({
            pk: 1, name: 'EECS 280', semester: Semester.winter, year: 2019, subtitle: '',
            num_late_days: 0, allowed_guest_domain: '', last_modified: ''
        });

        original_match_media = window.matchMedia;

        Object.defineProperty(window, "matchMedia", {
            value: jest.fn(() => {
                return {matches: true};
            })
        });

        wrapper = mount(CourseSettings, {
            propsData: {
                course: course_1,
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

    test('Course name is not the empty string - violates condition', async () => {
        let validated_name_input = <ValidatedInput> wrapper.find({ref: 'course_name_input'}).vm;
        let name_input = wrapper.find({ref: 'course_name_input'}).find('#input');

        expect(component.d_course.name).toEqual(course_1.name);
        expect(validated_name_input.is_valid).toBe(true);

        (<HTMLInputElement> name_input.element).value = "     ";
        name_input.trigger('input');
        await component.$nextTick();

        expect(validated_name_input.is_valid).toBe(false);
    });

    test('Year must be a number - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "twenty-nineteen";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be an integer - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "2020.5";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "1999";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Year must be a valid year (greater >= 2000) - meets condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "2000";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(true);
    });

    test('Year must not be empty - violates condition', async () => {
        let validated_year_input = <ValidatedInput> wrapper.find({ref: 'course_year_input'}).vm;
        let year_input = wrapper.find({ref: 'course_year_input'}).find('#input');

        expect(component.course.year).toEqual(2019);
        expect(validated_year_input.is_valid).toBe(true);

        (<HTMLInputElement> year_input.element).value = "";
        year_input.trigger('input');

        expect(validated_year_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "-1";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be negative - meets condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "0";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(true);
    });

    test('Late days must be a number - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "zero";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days must be an integer - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "1.5";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Late days cannot be empty - violates condition', async () => {
        let validated_late_days_input = <ValidatedInput> wrapper.find(
            {ref: 'course_late_days_input'}).vm;
        let late_days_input = wrapper.find({ref: 'course_late_days_input'}).find('#input');

        expect(component.course.num_late_days).toEqual(0);
        expect(validated_late_days_input.is_valid).toBe(true);

        (<HTMLInputElement> late_days_input.element).value = "";
        late_days_input.trigger('input');

        expect(validated_late_days_input.is_valid).toBe(false);
    });

    test('Clicking on the save updates button calls course.save', async () => {
        let save_settings_stub = sinon.stub(course_1, 'save');

        let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

        expect(settings_form.is_valid).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find('#course-settings-form').trigger('submit.native');
        await component.$nextTick();

        expect(save_settings_stub.calledOnce).toBe(true);
    });

    test('Course must be unique among courses - violates condition', async () => {
        let axios_response_instance: AxiosError = {
            name: 'AxiosError',
            message: 'u heked up',
            response: {
                data: {
                    __all__: "A course with this name, semester, and year " +
                             "already exists."
                },
                status: 400,
                statusText: 'OK',
                headers: {},
                request: {},
                config: {}
            },
            config: {},
        };
        sinon.stub(course_1, 'save').returns(Promise.reject(axios_response_instance));

        let settings_form = <ValidatedForm> wrapper.find('#course-settings-form').vm;

        expect(settings_form.is_valid).toBe(true);
        expect(component.settings_form_is_valid).toBe(true);

        wrapper.find('#course-settings-form').trigger('submit.native');
        await component.$nextTick();

        let api_errors = <APIErrors> wrapper.find({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });
});