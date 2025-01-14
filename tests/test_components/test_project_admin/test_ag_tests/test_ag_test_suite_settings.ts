import { mount, Wrapper } from '@vue/test-utils';

import * as ag_cli from 'ag-client-typescript';
import * as sinon from "sinon";

import APIErrors from '@/components/api_errors.vue';
import AGTestSuiteAdvancedFdbkSettings from '@/components/project_admin/ag_tests/ag_test_suite_advanced_fdbk_settings.vue';
import AGTestSuiteSettings from '@/components/project_admin/ag_tests/ag_test_suite_settings.vue';
import FeedbackConfigPanel from '@/components/project_admin/feedback_config_panel/feedback_config_panel.vue';
import SuiteSettings from '@/components/project_admin/suite_settings.vue';

import * as data_ut from '@/tests/data_utils';
import { managed_mount } from '@/tests/setup';
import {
    find_by_name,
    get_validated_input_text,
    set_data,
    set_props,
    set_validated_input_text,
    validated_input_is_valid,
    wait_for_load,
    wait_until,
} from '@/tests/utils';


describe('AGTestSuiteSettings tests', () => {
    let wrapper: Wrapper<AGTestSuiteSettings>;
    let ag_test_suite: ag_cli.AGTestSuite;
    let project: ag_cli.Project;
    let expected_student_files: ag_cli.ExpectedStudentFile[];
    let instructor_files: ag_cli.InstructorFile[];
    let global_sandbox_docker_images: ag_cli.SandboxDockerImage[];
    let course_sandbox_docker_images: ag_cli.SandboxDockerImage[];

    beforeEach(async () => {
        let course = data_ut.make_course();

        project = data_ut.make_project(course.pk);
        expected_student_files = [
            data_ut.make_expected_student_file(project.pk, "elephant*.cpp"),
            data_ut.make_expected_student_file(project.pk, "monkey?.cpp"),
            data_ut.make_expected_student_file(project.pk, "zebra.cpp"),
        ];
        instructor_files =  [
            data_ut.make_instructor_file(project.pk, "penguin.cpp"),
            data_ut.make_instructor_file(project.pk, "rabit.cpp"),
            data_ut.make_instructor_file(project.pk, "walrus.cpp"),
        ];
        project.expected_student_files = expected_student_files;
        project.instructor_files = instructor_files;

        ag_test_suite = data_ut.make_ag_test_suite(project.pk);
        ag_test_suite.instructor_files_needed = [instructor_files[0], instructor_files[1]];
        ag_test_suite.student_files_needed = [expected_student_files[0], expected_student_files[1]];

        global_sandbox_docker_images = [
            data_ut.make_sandbox_docker_image(null), data_ut.make_sandbox_docker_image(null)
        ];
        course_sandbox_docker_images = [
            data_ut.make_sandbox_docker_image(course.pk),
            data_ut.make_sandbox_docker_image(course.pk)
        ];
        sinon.stub(ag_cli.SandboxDockerImage, 'get_images').withArgs(
            null
        ).resolves(
            global_sandbox_docker_images
        ).withArgs(course.pk).resolves(course_sandbox_docker_images);

        wrapper = managed_mount(AGTestSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project,
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);
    });

    test('SandboxDockerImages loaded', async () => {
        expect(wrapper.vm.d_docker_images).toEqual(
            global_sandbox_docker_images.concat(course_sandbox_docker_images)
        );
    });

    test('SuiteSettings bindings ', async () => {
        let suite_settings = find_by_name<SuiteSettings>(wrapper, 'SuiteSettings');
        expect(suite_settings.vm.suite).toEqual(ag_test_suite);
        expect(suite_settings.vm.project).toEqual(project);
        expect(suite_settings.vm.docker_images).toEqual(
            global_sandbox_docker_images.concat(course_sandbox_docker_images)
        );

        let new_name = 'some new name';
        suite_settings.vm.$emit('field_change', {name: new_name});
        expect(wrapper.vm.d_ag_test_suite!.name).toEqual(new_name);
    });

    test('Suite description bindings', async () => {
        let internal_admin_notes_input = wrapper.findComponent({ref: 'internal_admin_notes'});
        await set_validated_input_text(internal_admin_notes_input, 'a tall stick for magic');

        expect(wrapper.vm.d_ag_test_suite!.internal_admin_notes).toEqual("a tall stick for magic");
        expect(validated_input_is_valid(internal_admin_notes_input)).toEqual(true);

        await set_validated_input_text(internal_admin_notes_input, '');
        expect(wrapper.vm.d_ag_test_suite!.internal_admin_notes).toEqual("");
        expect(validated_input_is_valid(internal_admin_notes_input)).toEqual(true);

        let staff_description_input = wrapper.findComponent({ref: 'staff_description'});
        await set_validated_input_text(staff_description_input, 'a tall stick for magic');

        expect(wrapper.vm.d_ag_test_suite!.staff_description).toEqual("a tall stick for magic");
        expect(validated_input_is_valid(staff_description_input)).toEqual(true);

        await set_validated_input_text(staff_description_input, '');
        expect(wrapper.vm.d_ag_test_suite!.staff_description).toEqual("");
        expect(validated_input_is_valid(staff_description_input)).toEqual(true);

        let student_description_input = wrapper.findComponent({ref: 'student_description'});
        await set_validated_input_text(student_description_input, 'some student description');

        expect(wrapper.vm.d_ag_test_suite!.student_description).toEqual("some student description");
        expect(validated_input_is_valid(student_description_input)).toEqual(true);

        await set_validated_input_text(student_description_input, '');
        expect(wrapper.vm.d_ag_test_suite!.student_description).toEqual("");
        expect(validated_input_is_valid(student_description_input)).toEqual(true);
    });

    test('setup_suite_cmd_name binding', async () => {
        let setup_suite_cmd_name_input = wrapper.findComponent({ref: 'setup_suite_cmd_name'});
        await set_validated_input_text(setup_suite_cmd_name_input, 'sunflower');

        expect(wrapper.vm.d_ag_test_suite!.setup_suite_cmd_name).toEqual("sunflower");
        expect(validated_input_is_valid(setup_suite_cmd_name_input)).toEqual(true);

        await set_validated_input_text(setup_suite_cmd_name_input, '');
        expect(wrapper.vm.d_ag_test_suite!.setup_suite_cmd_name).toEqual("");
        expect(validated_input_is_valid(setup_suite_cmd_name_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_suite: {setup_suite_cmd_name: "Rainbow"}});
        expect(get_validated_input_text(setup_suite_cmd_name_input)).toEqual("Rainbow");
    });

    test('setup_suite_cmd binding', async () => {
        let setup_suite_cmd_input = wrapper.findComponent({ref: 'setup_suite_cmd'});

        await set_validated_input_text(setup_suite_cmd_input, 'three to the right');

        expect(wrapper.vm.d_ag_test_suite!.setup_suite_cmd).toEqual(
            "three to the right"
        );
        expect(validated_input_is_valid(setup_suite_cmd_input)).toEqual(true);

        await set_validated_input_text(setup_suite_cmd_input, '');
        expect(wrapper.vm.d_ag_test_suite!.setup_suite_cmd).toEqual("");
        expect(validated_input_is_valid(setup_suite_cmd_input)).toEqual(true);

        await set_data(wrapper, {d_ag_test_suite: {setup_suite_cmd: "four to the left"}});
        expect(get_validated_input_text(setup_suite_cmd_input)).toEqual(
            "four to the left"
        );
    });

    test('Reject submission checkbox disabled when is_first_suite is false', async () => {
        // Disabled is the default
        expect(
            wrapper.find('[data-testid=reject_submission_if_setup_fails]').element
        ).toBeDisabled();

        await set_props(wrapper, {is_first_suite: true});
        expect(
            wrapper.find('[data-testid=reject_submission_if_setup_fails]').element
        ).not.toBeDisabled();
    });

    test('Save suite settings - successful', async () => {
        let save_stub = sinon.stub(wrapper.vm.d_ag_test_suite!, 'save');

        await wrapper.get('[data-testid=ag_test_suite_settings_form]').trigger('submit');
        expect(save_stub.calledOnce).toBe(true);
    });

    test('Save suite settings - unsuccessful', async () => {
        Element.prototype.scrollIntoView = () => {};
        let save_stub = sinon.stub(wrapper.vm.d_ag_test_suite!, 'save');
        save_stub.returns(
            Promise.reject(
                new ag_cli.HttpError(
                    400,
                    {__all__: "Ag test suite with this Name and Project already exists."}
                )
            )
        );

        await wrapper.get('[data-testid=ag_test_suite_settings_form]').trigger('submit');
        expect(await wait_until(wrapper, w => !w.vm.d_saving)).toBe(true);
        await wrapper.vm.$nextTick();
        expect(save_stub.calledOnce).toBe(true);

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'api_errors'}).vm;
        expect(api_errors.d_api_errors.length).toBe(1);
    });

    test('Delete a Suite', async () => {
        let delete_stub = sinon.stub(wrapper.vm.d_ag_test_suite!, 'delete');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_suite_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'delete_ag_test_suite_modal'}).exists()).toBe(false);

        wrapper.get('.delete-ag-test-suite-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_show_delete_ag_test_suite_modal).toBe(true);
        expect(wrapper.findComponent({ref: 'delete_ag_test_suite_modal'}).exists()).toBe(true);

        wrapper.get('.modal-delete-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(delete_stub.calledOnce).toBe(true);
        await wait_until(
            wrapper, w => !w.findComponent({ref: 'delete_ag_test_suite_modal'}).exists());
        expect(wrapper.vm.d_show_delete_ag_test_suite_modal).toBe(false);
        expect(wrapper.findComponent({ref: 'delete_ag_test_suite_modal'}).exists()).toBe(false);
    });

    test('API errors handled on suite deletion', async () => {
        sinon.stub(wrapper.vm.d_ag_test_suite!, 'delete').rejects(new ag_cli.HttpError(403, 'err'));
        await wrapper.vm.$nextTick();

        await wrapper.get('.delete-ag-test-suite-button').trigger('click');

        await wrapper.get('.modal-delete-button').trigger('click');
        expect(await wait_until(wrapper, w => !w.vm.d_deleting)).toBe(true);
        await wrapper.vm.$nextTick();

        let api_errors = <APIErrors> wrapper.findComponent({ref: 'delete_errors'}).vm;
        expect(api_errors.d_api_errors.length).toEqual(1);
    });

    test('Parent component changes the value of the ag_test_suite prop', async () => {
        let another_ag_suite = data_ut.make_ag_test_suite(project.pk);
        another_ag_suite.instructor_files_needed = [instructor_files[1], instructor_files[0]];
        another_ag_suite.student_files_needed = [
            expected_student_files[1], expected_student_files[0]
        ];

        expect(wrapper.vm.d_ag_test_suite!.pk).toEqual(ag_test_suite.pk);

        wrapper.setProps({'ag_test_suite': another_ag_suite});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suite!.pk).toEqual(another_ag_suite.pk);

        wrapper.setProps({'ag_test_suite': ag_test_suite});
        await wrapper.vm.$nextTick();

        expect(wrapper.vm.d_ag_test_suite!.pk).toEqual(ag_test_suite.pk);
    });
});

describe('AG test suite feedback tests', () => {
    let ag_test_suite: ag_cli.AGTestSuite;
    let project: ag_cli.Project = data_ut.make_project(data_ut.make_course().pk);

    beforeEach(() => {
        ag_test_suite = data_ut.make_ag_test_suite(project.pk);
        sinon.stub(ag_cli.SandboxDockerImage, 'get_images').returns(Promise.resolve([]));
    });

    test('Normal fdbk binding', async () => {
        ag_test_suite.normal_fdbk_config = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGTestSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);

        let normal_config_panel
            = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({ref: 'normal_config_panel'});
        expect(normal_config_panel.vm.value).toEqual(ag_test_suite.normal_fdbk_config);

        let normal_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.findComponent({
                ref: 'normal_edit_feedback_settings'});
        expect(normal_advanced_settings.vm.value).toEqual(ag_test_suite.normal_fdbk_config);

        let new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        normal_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.normal_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        normal_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.normal_fdbk_config).toEqual(new_val);
    });

    test('Final graded fdbk binding', async () => {
        ag_test_suite.ultimate_submission_fdbk_config = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGTestSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);


        let final_graded_config_panel = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({
            ref: 'final_graded_config_panel'
        });
        expect(final_graded_config_panel.vm.value).toEqual(
            ag_test_suite.ultimate_submission_fdbk_config);

        let final_graded_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.findComponent({
                ref: 'final_graded_edit_feedback_settings'});
        expect(final_graded_advanced_settings.vm.value).toEqual(
            ag_test_suite.ultimate_submission_fdbk_config);

        let new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        final_graded_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.ultimate_submission_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        final_graded_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.ultimate_submission_fdbk_config).toEqual(new_val);
    });

    test('Past limit fdbk binding', async () => {
        ag_test_suite.past_limit_submission_fdbk_config = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGTestSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);


        let past_limit_config_panel = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({
            ref: 'past_limit_config_panel'
        });
        expect(past_limit_config_panel.vm.value).toEqual(
            ag_test_suite.past_limit_submission_fdbk_config);

        let past_limit_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.findComponent({
                ref: 'past_limit_edit_feedback_settings'});
        expect(past_limit_advanced_settings.vm.value).toEqual(
            ag_test_suite.past_limit_submission_fdbk_config);

        let new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        past_limit_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.past_limit_submission_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        past_limit_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.past_limit_submission_fdbk_config).toEqual(new_val);
    });

    test('Student lookup fdbk binding', async () => {
        ag_test_suite.staff_viewer_fdbk_config = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: true,
            show_setup_stdout: false,
        });

        let wrapper = mount(AGTestSuiteSettings, {
            propsData: {
                ag_test_suite: ag_test_suite,
                project: project
            }
        });
        expect(await wait_for_load(wrapper)).toBe(true);


        let student_lookup_config_panel = <Wrapper<FeedbackConfigPanel>> wrapper.findComponent({
            ref: 'student_lookup_config_panel'
        });
        expect(student_lookup_config_panel.vm.value).toEqual(
            ag_test_suite.staff_viewer_fdbk_config);

        let student_lookup_advanced_settings
            = <Wrapper<AGTestSuiteAdvancedFdbkSettings>> wrapper.findComponent({
                ref: 'student_lookup_edit_feedback_settings'});
        expect(student_lookup_advanced_settings.vm.value).toEqual(
            ag_test_suite.staff_viewer_fdbk_config);

        let new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: true,
        });
        student_lookup_config_panel.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.staff_viewer_fdbk_config).toEqual(new_val);

        new_val = data_ut.make_ag_test_suite_fdbk_config({
            show_setup_return_code: false,
            show_setup_stdout: false,
        });
        student_lookup_advanced_settings.vm.$emit('input', new_val);
        expect(wrapper.vm.d_ag_test_suite!.staff_viewer_fdbk_config).toEqual(new_val);
    });
});
