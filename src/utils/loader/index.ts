import logUpdate, { LogUpdateRender } from './resources/log-update';
import { Spinner, Spinners } from './types';
import spinners from './spinners.json';

export default class Loader {
	private static appLoaders: Set<Loader> = new Set();
	private timer: NodeJS.Timeout | null = null;
	private logUpdate: LogUpdateRender | undefined;
	private doneMessage: string | undefined = undefined;
	private loaderMessage: string | undefined = undefined;

	/**
	 * Renders the spinner
	 * @param spinner The spinner to render
	 * @param index Variable to control the frames iteration
	 * @param description The description to show next to the spinner
	 */
	private renderSpinner(spinner: Spinner, index: number, description: string) {
		const { frames } = spinner;
		const message = `${description ? ' ' + description : ''}...`;

		this.logUpdate = logUpdate(frames[(index = ++index % frames.length)] +`${message}`);
		this.loaderMessage = message;
		return index;
	}

	/**
	 * Stops last loader in the list of loaders
	 */
	private stopLastLoader(){
		const lastSpinner = Array.from(Loader.appLoaders).pop();
		lastSpinner?.done();
	}

	/**
	 * Starts loader with a spinner and a description
	 * @param [description] The description to show next to the spinner
	 * @param [spinname] Spinner name
	 * @param [doneMessage] The message to show when the loader is done
	 */
	private start(description: string = '', spinname?: Spinners, doneMessage?: string): Loader {
		this.stopLastLoader();

		const name = spinname ?? 'dots';
		const spinner = spinners[name];

		let index = 0;
		index = this.renderSpinner(spinner, index, description);
		this.timer = setInterval(() => {
			index = this.renderSpinner(spinner, index, description);
		}, spinner.interval);

		if (doneMessage) {
			this.doneMessage = doneMessage;
		}

		Loader.appLoaders.add(this);
		return this;
	}

	/**
	 * Persist the loader and mark it as done
	 */
	private done() {
		if (this.logUpdate) {
			const finalMessage = this.doneMessage ? this.doneMessage : this.loaderMessage;
			this.logUpdate = logUpdate('✔' + ' ' + finalMessage);
			this.logUpdate?.done();
		}

		if (this.timer) {
			clearInterval(this.timer);
			this.timer = null;
		}
		Loader.appLoaders.delete(this);
	}

	/**
	 * Stops all loaders that are not set to stayLoading
	 */
	public static stopAll() {
		Loader.appLoaders.forEach((spinner) => {
			spinner.done();
		});
	}

	/**
	 * Stops the current loader and removes it from the list of loaders
	 */
	public stop() {
		this.done();
	}

	/**
	 * Creates a new loader and adds it to the list of loaders
	 * @param description The description to show next to the spinner
	 * @param options Options for the loader
	 * @param options.spinname The name of the spinner to use
	 * @param options.doneMessage The message to show when the loader is done
	 */
	public static create(
		description: string = '',
		options?: { spinname?: Spinners, doneMessage: string }
	) {
		return new Loader().start(description, options?.spinname, options?.doneMessage);
	}
}
